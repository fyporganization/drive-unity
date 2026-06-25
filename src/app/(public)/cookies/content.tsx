"use client";

import { motion } from "framer-motion";

const LAST_UPDATED = "June 16, 2026";

const sections = [
  {
    title: "1. What Are Cookies",
    body: "Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences over time.",
  },
  {
    title: "2. How We Use Cookies",
    body: "DriveUnity uses cookies primarily to keep you signed in and to maintain your session securely. We rely on an essential authentication cookie so the service knows you are logged in as you move between pages.",
  },
  {
    title: "3. Essential Cookies",
    body: "These cookies are required for the service to function. They store your session information and cannot be disabled without affecting your ability to sign in and use DriveUnity.",
  },
  {
    title: "4. Analytics & Performance",
    body: "We may use limited, privacy-respecting analytics to understand how the service is used and to improve it. These do not identify you personally.",
  },
  {
    title: "5. Managing Cookies",
    body: "You can control or delete cookies through your browser settings. Note that removing the essential session cookie will sign you out of DriveUnity.",
  },
  {
    title: "6. Changes to This Policy",
    body: "We may update this cookie policy from time to time. The latest revision date is shown at the top of this page.",
  },
  {
    title: "7. Contact",
    body: "If you have questions about how we use cookies, please reach out through our contact page.",
  },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const CookiesContent = () => {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28 bg-gradient-surface grid-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div {...fade}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-4">
              Cookie <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-10">
          {sections.map((section) => (
            <motion.div key={section.title} {...fade}>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default CookiesContent;
