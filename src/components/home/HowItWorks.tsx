"use client";

import { motion } from "framer-motion";
import { Link2, Cpu, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Link2,
    step: "01",
    title: "Connect Your Drive",
    description: "Securely link your Google Drive in one click.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "We Process Your Files",
    description: "DriveUnity understands your documents, images, and folders automatically.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Ask & Discover",
    description: "Search naturally and get intelligent answers instantly.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Up and running in <span className="text-gradient">three steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No complicated setup. No manual organization. Just clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="relative text-center"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
                <item.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">{item.step}</span>
              <h3 className="font-display font-semibold text-xl text-foreground mt-2 mb-3">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
