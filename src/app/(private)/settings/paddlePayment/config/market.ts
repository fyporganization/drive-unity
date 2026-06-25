interface MarketingContent {
    subtitle: string;
    features: string[];
    popular: boolean;
    badge?: string;
}

export const marketingPlans: Record<string, MarketingContent> = {
    BASE: {
        subtitle: 'Best for small teams',
        features: [
            'Up to 3 Connected Drives',
            'Unlimited File Indexing',
            'Advanced Filtration',
            'AI Semantic Search',
        ],
        popular: true,
        badge: 'Most Popular',
    },
    PRO: {
        subtitle: 'For power users & agencies',
        features: [
            'Up to 5 Connected Drives',
            'Unlimited File Indexing',
            'Advanced Filtration',
            'AI Semantic Search',
        ],
        popular: false,
    },
}