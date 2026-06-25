import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

function serializeBigInt<T>(data: T): T {
    return JSON.parse(
        JSON.stringify(data, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    )
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const userId = url.searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

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
