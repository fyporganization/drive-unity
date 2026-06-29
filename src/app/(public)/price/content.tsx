"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For individuals getting started",
    features: [
      '1 Cloud Connection',
      '50 Monthly Searches',
      'AI Semantic Search',
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Base",
    price: "$10",
    period: "/month",
    description: "For power users and small teams",
    features: [
      'Both Clouds (Google Drive + OneDrive)',
      'Unlimited Searches',
      'Duplicate Detection',
      'Freshness Score',
      'Advanced Filtration',
      'AI Semantic Search',
    ],
    cta: "Start Base Plan",
    highlighted: true,
    badge: "Recommended",
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    period: "",
    description: "For large organizations",
    features: [
      'Team-based access',
      'Everything in Base',
      'API Access',
      'Priority support',
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "How does the free trial work?",
    a: "You can start with our Starter plan at no cost. No credit card required. Upgrade anytime to unlock more features.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use enterprise-grade encryption and never store your file contents. Your data remains in your Google Drive at all times.",
  },
  {
    q: "What file types are supported?",
    a: "DriveUnity supports all common file types including PDFs, documents, spreadsheets, presentations, images, and scanned files.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. We offer a 30-day money-back guarantee on all paid plans. No questions asked.",
  },
];

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28 bg-gradient-surface grid-pattern relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-4">
              Simple pricing. <span className="text-gradient">Powerful results.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade when you're ready.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 -mt-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-gradient-primary text-primary-foreground border-primary shadow-elevated scale-105"
                    : "bg-card text-foreground border-border hover:shadow-card"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-foreground text-background text-xs font-semibold">
                    {tier.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-xl mb-1">{tier.name}</h3>
                  <p className={`text-sm ${tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {tier.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ${tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {tier.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlighted ? "secondary" : "hero"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href={tier.name === "Enterprise" ? "/contact" : "/auth"}>
                    {tier.cta} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-surface">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{faq.q}</span>
                  <span className={`text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
