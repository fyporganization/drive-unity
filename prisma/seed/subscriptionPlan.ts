import { PrismaClient } from "../../src/generated/prisma/index.js"

const prisma = new PrismaClient()

async function main() {
    await prisma.subscriptionPlan.createMany({
        skipDuplicates: true,
        data: [
            {
                packageName: "Free",
                tier: "FREE",
                maxConnectedDrives: 2,
                noOfAccounts: 2,
                actionLimit: true,
                cycle: "monthly",
                features: ["1 Drive"],
                description: "Free plan",
                monthlyPrice: null,
                yearlyPrice: null,
            },
            {
                packageName: "Base",
                tier: "BASE",
                maxConnectedDrives: 3,
                noOfAccounts: 3,
                actionLimit: true,
                cycle: "monthly",
                features: ["3 Drives"],
                description: "Base plan",
                monthlyPrice: 9.99,
                yearlyPrice: 99.99,
            },
            {
                packageName: "Pro",
                tier: "PRO",
                maxConnectedDrives: 5,
                noOfAccounts: 5,
                actionLimit: false,
                cycle: "monthly",
                features: ["5 Drives"],
                description: "Pro plan",
                monthlyPrice: 19.99,
                yearlyPrice: 199.99,
            },
        ],
    })

    console.log("✅ Subscription plans seeded with pricing")
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
