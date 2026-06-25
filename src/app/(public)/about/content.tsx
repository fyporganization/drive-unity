"use client";

import { motion } from "framer-motion";
import { FolderSearch, ScanText, ImageOff, Clock, Lightbulb, Brain, Shield, Users } from "lucide-react";

const problems = [
  { icon: FolderSearch, text: "Files buried in folders" },
  { icon: ScanText, text: "Scanned documents you can't search" },
  { icon: ImageOff, text: "Images with hidden information" },
  { icon: Clock, text: "Wasted time looking for answers" },
];

const principles = [
  { icon: Lightbulb, title: "Simplicity First", description: "Connect and start instantly." },
  { icon: Brain, title: "Intelligence Built-In", description: "Understands your content automatically." },
  { icon: Shield, title: "Secure & Private", description: "Your data stays protected." },
  { icon: Users, title: "Scalable for Teams", description: "Built for individuals and organizations." },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const About = () => {
  return (
    <>
      {/* Header */}
      <section className="py-20 md:py-28 bg-gradient-surface grid-pattern relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div {...fade}>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">About Us</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-6">
              Built to Make Your Drive{" "}
              <span className="text-gradient">Work for You</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div {...fade} className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Most teams store everything in Google Drive. But finding the right file at the right time shouldn't feel impossible.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              DriveUnity was built to transform messy, unstructured storage into a smart, searchable knowledge hub.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 bg-gradient-surface">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">The Problem</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {problems.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <motion.div {...fade}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">The Solution</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              DriveUnity connects to your Drive and intelligently understands your content — so you can search naturally and get instant results.
            </p>
            <div className="flex flex-col gap-2 text-lg font-medium text-foreground">
              <p>No manual organization.</p>
              <p>No complicated setup.</p>
              <p className="text-gradient font-bold text-xl">Just clarity.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 bg-gradient-surface">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Core Principles</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {principles.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-card transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-soft">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
