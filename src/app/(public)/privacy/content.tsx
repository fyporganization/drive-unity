"use client";

import { motion } from "framer-motion";

const LAST_UPDATED = "June 16, 2026";

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect the email address and name you provide when you create an account, and the file metadata and content from the cloud drives you choose to connect. We also collect basic usage data to operate and improve the service.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to provide search and organization features across your connected drives, to authenticate you, to communicate important account information, and to maintain the security of the service.",
  },
  {
    title: "3. Connected Drive Access",
    body: "When you connect a drive, we access only the data needed to index and search your files. We do not sell your file content or use it for advertising. You can revoke access at any time by disconnecting the drive.",
  },
  {
    title: "4. Data Storage & Security",
    body: "We store derived metadata to power search. Sensitive credentials are encrypted at rest. We apply reasonable technical and organizational measures to protect your data, though no system can be guaranteed fully secure.",
  },
  {
    title: "5. Email Communications",
    body: "We use your email to send verification codes and essential account notifications. We do not send marketing emails without your consent.",
  },
  {
    title: "6. Data Retention & Deletion",
    body: "We retain your data while your account is active. When you delete your account or disconnect a drive, the associated indexed data is removed.",
  },
  {
    title: "7. Third-Party Services",
    body: "We rely on third-party providers (such as cloud storage APIs and email delivery) solely to operate the service. These providers process data only as needed to perform their function.",
  },
  {
    title: "8. Your Rights",
    body: "You may access, update, or delete your personal information at any time through your account settings, or by contacting us.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this policy from time to time. We will reflect the latest revision date at the top of this page.",
  },
  {
    title: "10. Contact",
    body: "If you have questions about this privacy policy, please reach out through our contact page.",
  },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const PrivacyContent = () => {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28 bg-gradient-surface grid-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div {...fade}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-4">
              Privacy <span className="text-gradient">Policy</span>
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

export default PrivacyContent;
