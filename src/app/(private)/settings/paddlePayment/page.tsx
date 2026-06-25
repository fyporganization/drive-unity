'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles, Crown, Loader2 } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SettingsSidebar } from '@/app/(private)/settings/_components/sidebar';
import { PricingCard } from '@/app/(private)/settings/paddlePayment/_components/PricingCard';
import {
  PaddleLoader,
  usePaddle,
} from '@/app/(private)/settings/paddlePayment/_components/Loader';
import {
  useSubscriptionData,
  useCurrentSubscription,
} from '@/app/(private)/settings/paddlePayment/hooks/usePaddleHooks';
import {
  SubscriptionPlan,
  BillingCycle,
} from '@/app/(private)/settings/paddlePayment/types/types';
import { useUserId } from '@/app/(private)/hooks/useAuthStatus';

const queryClient = new QueryClient();

function SubscriptionPageContent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const user = useUserId();
  const userId = user.userId || '';
  const userEmail = user.email || '';

  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useSubscriptionData(userId, userEmail);
  const { data: currentSub } = useCurrentSubscription(userId);
  const { Paddle, isReady: paddleReady } = usePaddle();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!Paddle || !paddleReady) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    setSubscribingTo(plan.uuid);

    try {
      const priceId =
        plan.tier === 'BASE'
          ? subscriptionData?.paddleConfig.heavyCleaningPkg
          : subscriptionData?.paddleConfig.extendedCleaningPkg;

      Paddle.Checkout.open({
        items: [{ priceId }],
        customData: {
          user_id: userId,
          package_uuid: plan.uuid,
        },
        customer: {
          email: userEmail,
        },
        successUrl: subscriptionData?.paddleConfig.successUrl,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to open checkout. Please try again.');
    } finally {
      setSubscribingTo(null);
    }
  };

  const paidPlans =
    subscriptionData?.subscription_plans.filter(
      (plan: SubscriptionPlan) => plan.tier !== 'FREE'
    ) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading subscription plans...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-800">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Failed to load subscription plans. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      {subscriptionData && (
        <PaddleLoader token={subscriptionData.paddleConfig.clientToken} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8 lg:p-10 max-w-6xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Subscription & Billing
            </h1>
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the perfect plan for your needs
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:w-[240px] shrink-0"
          >
            <SettingsSidebar />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-8"
          >
            {/* Current Plan */}
            {currentSub && (
              <Card className="rounded-xl border-border/50 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Current Plan
                      </p>
                      <p className="text-xl font-display font-bold text-primary">
                        {currentSub.subscriptionPlan.packageName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-50">
                        Active
                      </Badge>
                      {currentSub.subEndTime && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Renews{' '}
                          {new Date(
                            currentSub.subEndTime
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center bg-muted/60 rounded-full p-1 gap-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Yearly
                  <span className="ml-1.5 text-xs text-emerald-600 font-semibold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paidPlans.map((plan: SubscriptionPlan) => (
                <PricingCard
                  key={plan.uuid}
                  plan={plan}
                  billingCycle={billingCycle}
                  onSubscribe={handleSubscribe}
                  isCurrentPlan={
                    currentSub?.subscriptionPlanId === plan.uuid
                  }
                  isLoading={subscribingTo === plan.uuid}
                />
              ))}
            </div>

            {/* Info Bar */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-800">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                All plans include automatic backups and 24/7 customer support.
                You can upgrade or downgrade your plan at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default function SubscriptionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionPageContent />
    </QueryClientProvider>
  );
}
