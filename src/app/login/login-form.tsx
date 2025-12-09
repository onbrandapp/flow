"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createSession } from "@/app/login/actions";
import { useState } from "react";

export default function LoginForm({ next }: { next: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await createSession(idToken);
        } catch (error) {
            console.error("Login failed", error);
            setIsLoading(false);
        }
    };

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

            <div className="space-y-4">
                <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl text-lg bg-white text-black hover:bg-gray-100 border border-gray-200"
                >
                    {isLoading ? "Signing in..." : "Sign in with Google"}
                </Button>
            </div>
        </motion.div>
    );
}
