"use client";

import { motion } from "framer-motion";
import { Search, ScanText, Image, Zap, Users, Lock } from "lucide-react";

const features = [
  { icon: Search, title: "Deep Search Across Files", description: "Find content buried deep within documents, spreadsheets, and presentations." },
  { icon: ScanText, title: "Understand Scanned Documents", description: "Extract and search text from scanned PDFs and images effortlessly." },
  { icon: Image, title: "Extract Meaning From Images", description: "Identify objects, text, and context within your visual files." },
  { icon: Zap, title: "Instant Smart Answers", description: "Ask questions and get precise answers from your entire Drive." },
  { icon: Users, title: "Built For Teams", description: "Collaborate seamlessly with shared workspaces and team insights." },
  { icon: Lock, title: "Secure & Reliable", description: "Your data is encrypted and never shared. Full compliance built in." },
];

const FeatureHighlights = () => {
  return (
    <section id="features" className="py-24 bg-gradient-surface grid-pattern">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Powerful capabilities, <span className="text-gradient">simple experience</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-xl bg-card/80 border border-border hover:shadow-soft transition-all duration-300"
            >
              <div className="w-10 h-10 shrink-0 rounded-lg bg-accent flex items-center justify-center">
                <item.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
