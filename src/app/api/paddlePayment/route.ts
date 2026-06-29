import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/server"

const prisma = new PrismaClient()

function serializeBigInt<T>(data: T): T {
    return JSON.parse(
        JSON.stringify(data, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    )
}

export async function GET() {
    try {
        const auth = await requireAuth()
        if (auth instanceof NextResponse) return auth
        const userId = auth.id

        let subscription = await prisma.subscribedUser.findUnique({
            where: { userId },
            include: { subscriptionPlan: true },
        })

        if (!subscription) {
            const freePlan = await prisma.subscriptionPlan.findFirst({
                where: { packageName: "Free" },
            })

            if (!freePlan) {
                return NextResponse.json(
                    { error: "Free plan not found" },
                    { status: 500 }
                )
            }

            subscription = await prisma.subscribedUser.create({
                data: {
                    userId,
                    subscriptionPlanId: freePlan.uuid,
                    connectedAccounts: 0,
                    usage: 0,
                    subStartTime: null,
                    subEndTime: null,
                },
                include: { subscriptionPlan: true },
            })
        }

        return NextResponse.json(serializeBigInt(subscription))
    } catch (error) {
        console.error("Error fetching subscription:", error)
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        )
    }
}
