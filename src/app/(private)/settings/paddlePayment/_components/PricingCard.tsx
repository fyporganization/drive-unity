'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan, BillingCycle } from '../types/types';
import { marketingPlans } from '../config/market';

interface PricingCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  onSubscribe: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
}

export const PricingCard = ({
  plan,
  billingCycle,
  onSubscribe,
  isCurrentPlan,
  isLoading,
}: PricingCardProps) => {
  const price =
    billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const marketing =
    marketingPlans[plan.tier as keyof typeof marketingPlans];
  const isPopular = marketing?.popular;
  const isContactPricing = price === null || price === undefined;

  if (!marketing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={`rounded-xl shadow-soft relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated h-full ${
          isPopular ? 'border-primary/40 border-2' : 'border-border/50'
        }`}
      >
        {isPopular && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-cta" />
        )}
        <CardContent className="p-6 space-y-6 flex flex-col h-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-bold text-foreground">
                {plan.packageName}
              </h3>
              {isPopular && (
                <Badge className="bg-primary/10 text-primary border-0 text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              {isContactPricing ? (
                <span className="text-3xl font-display font-bold text-foreground">
                  Contact Us
                </span>
              ) : (
                <>
                  <span className="text-3xl font-display font-bold text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </>
              )}
            </div>
          </div>

          <ul className="space-y-3 flex-1">
            {marketing.features.map((feature: string) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>

          {isContactPricing ? (
            <Button
              className="w-full mt-auto"
              variant={isPopular ? 'default' : 'outline'}
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          ) : (
            <Button
              className="w-full mt-auto"
              variant={
                isCurrentPlan
                  ? 'outline'
                  : isPopular
                  ? 'default'
                  : 'outline'
              }
              disabled={isCurrentPlan || isLoading}
              onClick={() => onSubscribe(plan)}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCurrentPlan ? 'Current Plan' : 'Get Started'}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
