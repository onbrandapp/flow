"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-serif font-bold tracking-tight text-foreground">
            Radical <span className="text-gradient">Generosity.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
            A boundless ecosystem where resources flow freely from those who have
            to those who need. No friction. No shame. Just flow.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/need">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <Heart className="mr-2 h-5 w-5" />
              I Have a Need
            </Button>
          </Link>
          <Link href="/give">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full shadow-sm hover:shadow-md transition-all duration-300 border-2">
              <Gift className="mr-2 h-5 w-5" />
              I Have to Give
            </Button>
          </Link>
        </div>

        <div className="flex justify-center pt-4">
          <Link href="/feed">
            <Button variant="link" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse Community Feed <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="pt-12 md:pt-16 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 text-muted-foreground/50"
        >
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <span className="text-2xl md:text-3xl font-bold">100%</span>
            <span className="text-xs md:text-sm uppercase tracking-wider">Free</span>
          </div>
          <div className="hidden md:block w-px bg-border/50 h-12" />
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <span className="text-2xl md:text-3xl font-bold">Local</span>
            <span className="text-xs md:text-sm uppercase tracking-wider">Community</span>
          </div>
          <div className="hidden md:block w-px bg-border/50 h-12" />
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <span className="text-2xl md:text-3xl font-bold">Direct</span>
            <span className="text-xs md:text-sm uppercase tracking-wider">Impact</span>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
