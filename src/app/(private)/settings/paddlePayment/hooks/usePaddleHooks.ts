import { useQuery } from '@tanstack/react-query'
import { PaddlePaymentData, SubscribedUser } from '@/app/(private)/settings/paddlePayment/types/types'

export const useSubscriptionData = (userId: string, userEmail: string) => {
    return useQuery<PaddlePaymentData>({
        queryKey: ['subscription-data', userId],
        queryFn: async () => {
            const response = await fetch(`/api/paddlePayment/payment`)
            if (!response.ok) throw new Error('Failed to fetch subscription data')
            return response.json()
        },
        enabled: !!userId && !!userEmail,
    })
}

export const useCurrentSubscription = (userId: string) => {
    return useQuery<SubscribedUser>({
        queryKey: ['current-subscription', userId],
        queryFn: async () => {
            const response = await fetch(`/api/paddlePayment`)
            if (!response.ok) throw new Error('Failed to fetch current subscription')
            return response.json()
        },
        enabled: !!userId,
    })
}