'use server'

import { Prisma, PrismaClient } from "@/generated/prisma"
import dayjs from "dayjs"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()


export async function GET(req: NextRequest) {
console.log("DEBUG ENV:", {
    tokenFound: !!process.env.PADDLE_CLIENT_TOKEN,
    tokenValue: process.env.PADDLE_CLIENT_TOKEN?.substring(0, 10) + "..."
});
    try {
        const url = new URL(req.url)
        const userId = url.searchParams.get("userId") ?? ""
        const userEmail = url.searchParams.get("userEmail") ?? ""

        const subscriptionPlans = await prisma.subscriptionPlan.findMany()
        subscriptionPlans.forEach(plan => {
            if (plan.monthlyPrice !== null) {
                plan.monthlyPrice = new Prisma.Decimal(
                    Number(plan.monthlyPrice).toFixed(1)
                )
            }

            if (plan.yearlyPrice !== null) {
                plan.yearlyPrice = new Prisma.Decimal(
                    Number(plan.yearlyPrice).toFixed(1)
                )
            }
        }) 
        console.log(subscriptionPlans);
        return NextResponse.json({
            user_id: userId,
            user_email: userEmail,
            subscription_plans: subscriptionPlans,
            paddleConfig: {
                clientToken: process.env.PADDLE_CLIENT_TOKEN,
                gettingStartedPkg: process.env.GETTING_STARTED_PKG,
                extendedCleaningPkg: process.env.EXTENDED_CLEANING_PKG,
                heavyCleaningPkg: process.env.HEAVY_CLEANING_PKG,
                successUrl: process.env.PADDLE_SUCCESS_URL,
            },
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()
        const status = payload.data.status
        const userId = payload.data.custom_data.user_id

        if (status === "active") {
            const purchasedPackageUuid = payload.data.items[0].price.custom_data.package_uuid
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
        } else {
            const freePlan = await prisma.subscriptionPlan.findFirst({
                where: { packageName: "Free" },
            })
            if (!freePlan) throw new Error("Free plan not found")

            await prisma.subscribedUser.update({
                where: { userId },
                data: {
                    subscriptionPlanId: freePlan.uuid,
                    subStartTime: null,
                    subEndTime: null,
                },
            })
        }

        return NextResponse.json({ status: "successfully updated" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }
}
