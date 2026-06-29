interface MarketingContent {
    subtitle: string;
    features: string[];
    popular: boolean;
    badge?: string;
}

export const marketingPlans: Record<string, MarketingContent> = {
    BASE: {
        subtitle: 'Best for power users & small teams',
        features: [
            'Both Clouds (Google Drive + OneDrive)',
            'Unlimited Searches',
            'Duplicate Detection',
            'Freshness Score',
            'Advanced Filtration',
            'AI Semantic Search',
        ],
        popular: true,
        badge: 'Most Popular',
    },
    ENTERPRISE: {
        subtitle: 'For large organizations & teams',
        features: [
            'Team-based access',
            'Everything in Base',
            'API Access',
            'Priority support',
        ],
        popular: false,
    },
}
