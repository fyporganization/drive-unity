import { PrismaClient } from "@/generated/prisma"
import dayjs from "dayjs"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const prisma = new PrismaClient()

function verifyPaddleSignature(
    rawBody: string,
    signatureHeader: string,
    secretKey: string
): boolean {
    try {
        const signatureParts = signatureHeader.split(';')
        const timestamp = signatureParts[0].split('=')[1]
        const signatures = signatureParts.slice(1).map(part => part.split('=')[1])

        const signedPayload = `${timestamp}:${rawBody}`

        for (const signature of signatures) {
            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(signedPayload)
                .digest('hex')

            if (crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            )) {
                return true
            }
        }

        return false
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}

function checkSignature(rawBody: string, req: NextRequest): NextResponse | null {
    const paddleSignature = req.headers.get('paddle-signature')
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET_TOKEN

    if (!paddleSignature || !webhookSecret) {
        console.warn('Webhook signature verification skipped (no signature or secret)')
        return null
    }

    if (!verifyPaddleSignature(rawBody, paddleSignature, webhookSecret)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpsert(payload: any): Promise<NextResponse | null> {
    const userId = payload.data.custom_data?.user_id
    if (!userId) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    if (payload.data.status !== 'active') {
        return null
    }

    const purchasedPackageUuid = payload.data.custom_data?.package_uuid
    if (!purchasedPackageUuid) {
        return NextResponse.json({ error: "Package UUID not found" }, { status: 400 })
    }

    const startsAt = payload.data.current_billing_period?.starts_at
    const endsAt = payload.data.current_billing_period?.ends_at

    await prisma.subscribedUser.update({
        where: { userId },
        data: {
            subscriptionPlanId: purchasedPackageUuid,
            subStartTime: startsAt ? dayjs(startsAt).toDate() : null,
            subEndTime: endsAt ? dayjs(endsAt).toDate() : null,
        },
    })
    return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionEnd(payload: any): Promise<NextResponse | null> {
    const userId = payload.data.custom_data?.user_id
    if (!userId) {
        return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    const freePlan = await prisma.subscriptionPlan.findFirst({
        where: { packageName: "Free" },
    })
    if (!freePlan) {
        return NextResponse.json({ error: "Free plan not found" }, { status: 404 })
    }

    await prisma.subscribedUser.update({
        where: { userId },
        data: {
            subscriptionPlanId: freePlan.uuid,
            subStartTime: null,
            subEndTime: null,
        },
    })
    return null
}

const UPSERT_EVENTS = ['subscription.created', 'subscription.updated']
const END_EVENTS = ['subscription.cancelled', 'subscription.expired']

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text()

        const signatureError = checkSignature(rawBody, req)
        if (signatureError) return signatureError

        const payload = JSON.parse(rawBody)
        const eventType = payload.event_type

        if (UPSERT_EVENTS.includes(eventType)) {
            const result = await handleSubscriptionUpsert(payload)
            if (result) return result
        }

        if (END_EVENTS.includes(eventType)) {
            const result = await handleSubscriptionEnd(payload)
            if (result) return result
        }

        return NextResponse.json({ status: "success", event: eventType })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
}