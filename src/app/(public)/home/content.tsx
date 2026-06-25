'use client';

import React from 'react';
import HeroSection from "@/components/home/HeroSection";
import ValueProps from "@/components/home/ValueProps";
import HowItWorks from "@/components/home/HowItWorks";
import FeatureHighlights from "@/components/home/FeatureHighlights";
import SocialProof from "@/components/home/SocialProof";
import PricingPreview from "@/components/home/PricingPreview";

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <ValueProps />
            <HowItWorks />
            <FeatureHighlights />
            <SocialProof />
            <PricingPreview />
        </>
    );
}