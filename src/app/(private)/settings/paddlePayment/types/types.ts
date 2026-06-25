export interface SubscriptionPlan {
    uuid: string
    packageName: string
    monthlyPrice: number | null
    yearlyPrice: number | null
    noOfAccounts: number
    noOfEmailAccounts: number | null
    noOfCloudAccounts: number | null
    noOfSocialAccounts: number | null
    maxConnectedDrives: number
    tier: 'FREE' | 'BASE' | 'PRO'
    actionLimit: boolean
    cycle: 'monthly' | 'yearly'
    features: string[]
    description: string
    createdAt: string
    updatedAt: string
}

export interface SubscribedUser {
    uuid: string
    userId: string
    subscriptionPlanId: string
    connectedAccounts: number
    connectedEmailAccounts: number
    connectedCloudAccounts: number
    connectedSocialAccounts: number
    usage: number
    emailDeletionUsage: bigint
    cloudDeletionUsage: bigint
    socialDeletionUsage: bigint
    paidAmount: number | null
    subStartTime: string | null
    subEndTime: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
    subscriptionPlan: SubscriptionPlan
}

export interface PaddleConfig {
    clientToken: string
    gettingStartedPkg: string
    extendedCleaningPkg: string
    heavyCleaningPkg: string
    successUrl: string
}

export interface PaddlePaymentData {
    user_id: string
    user_email: string
    subscription_plans: SubscriptionPlan[]
    paddleConfig: PaddleConfig
}

export type BillingCycle = 'monthly' | 'yearly'