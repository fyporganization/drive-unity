import { PrismaClient } from "../../src/generated/prisma/index.js"
import { SUBSCRIPTION_TIERS } from "../../src/lib/constants/plans"

const [FREE, BASE, ENTERPRISE] = SUBSCRIPTION_TIERS

const prisma = new PrismaClient()

async function main() {
    await prisma.subscriptionPlan.createMany({
        skipDuplicates: true,
        data: [
            {
                packageName: "Free",
                tier: FREE,
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
                tier: BASE,
                maxConnectedDrives: 3,
                noOfAccounts: 3,
                actionLimit: true,
                cycle: "monthly",
                features: ["Both clouds", "Unlimited searches", "Duplicate detection", "Freshness score", "Advanced filtration"],
                description: "Base plan",
                monthlyPrice: 10,
                yearlyPrice: 100,
            },
            {
                packageName: "Enterprise",
                tier: ENTERPRISE,
                maxConnectedDrives: 5,
                noOfAccounts: 5,
                actionLimit: false,
                cycle: "monthly",
                features: ["Team based", "Everything in Base", "API access", "Priority support"],
                description: "Enterprise plan — contact sales for custom pricing",
                monthlyPrice: null,
                yearlyPrice: null,
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
