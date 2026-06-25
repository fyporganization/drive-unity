"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at Acme",
    quote: "DriveUnity saved our team hours every week. Finding documents is now instant instead of a guessing game.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "CEO at Startupify",
    quote: "We switched from manual file management and never looked back. The AI search is a game changer.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Operations Lead at ScaleUp",
    quote: "The ability to search inside images and scanned documents alone was worth it. Incredible product.",
    rating: 5,
  },
];

const SocialProof = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Loved by teams <span className="text-gradient">everywhere</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6">"{item.quote}"</p>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
