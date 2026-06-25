"use client";

import { motion } from "framer-motion";

const LAST_UPDATED = "June 16, 2026";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using DriveUnity, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service.",
  },
  {
    title: "2. Use of the Service",
    body: "DriveUnity lets you connect your cloud storage accounts (such as Google Drive and OneDrive) to search, organize, and manage your files. You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it.",
  },
  {
    title: "3. Connected Accounts",
    body: "When you connect a third-party drive, you authorize DriveUnity to access file metadata and content needed to provide search and organization features. You can disconnect any account at any time, which revokes that access.",
  },
  {
    title: "4. Acceptable Use",
    body: "You agree not to misuse the service, including attempting to access data that is not yours, disrupting the service, or using it for any unlawful purpose.",
  },
  {
    title: "5. Intellectual Property",
    body: "Your files remain yours. DriveUnity does not claim ownership of any content you connect. All DriveUnity software, branding, and design remain the property of DriveUnity.",
  },
  {
    title: "6. Termination",
    body: "We may suspend or terminate your access if you violate these terms. You may stop using the service and delete your account at any time.",
  },
  {
    title: "7. Disclaimer & Limitation of Liability",
    body: "The service is provided \"as is\" without warranties of any kind. DriveUnity is not liable for any indirect or consequential damages arising from your use of the service.",
  },
  {
    title: "8. Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "9. Contact",
    body: "If you have questions about these terms, please reach out through our contact page.",
  },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const TermsContent = () => {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28 bg-gradient-surface grid-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div {...fade}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-4">
              Terms of <span className="text-gradient">Service</span>
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

export default TermsContent;
