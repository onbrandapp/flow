"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/app/login/actions";

export default function LoginForm({ next }: { next: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md z-10 bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold mb-2">Welcome Back</h1>
                <p className="text-muted-foreground">Sign in to join the flow.</p>
            </div>

            <form className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <div className="space-y-2">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <input
                            name="email"
                            type="email"
                            placeholder="hello@example.com"
                            required
                            className="w-full bg-background/50 border border-border rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>
                <Button
                    formAction={login}
                    className="w-full h-12 rounded-xl text-lg bg-foreground text-background hover:bg-foreground/90"
                >
                    Send Magic Link
                </Button>
            </form>
        </motion.div>
    );
}
