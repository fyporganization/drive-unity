"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, FileText, Shield } from "lucide-react";

const values = [
  {
    icon: Search,
    title: "Find Anything Instantly",
    description: "Search across all your Drive files in seconds — even inside images and scanned documents.",
  },
  {
    icon: Sparkles,
    title: "Smart Organization",
    description: "Automatically understand and structure your content so nothing gets lost.",
  },
  {
    icon: FileText,
    title: "AI-Powered Insights",
    description: "Get summaries, context, and answers from your documents instantly.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Enterprise-level security with full control over your data.",
  },
];

const ValueProps = () => {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to{" "}
            <span className="text-gradient">work smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop digging through folders. Let DriveUnity surface the right information, right when you need it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <item.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
