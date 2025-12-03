"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitNeed } from "@/app/actions";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NeedPage() {
    const [content, setContent] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved draft on mount
        const savedContent = localStorage.getItem("need_draft_content");
        const savedAnon = localStorage.getItem("need_draft_anon");
        if (savedContent) setContent(savedContent);
        if (savedAnon) setIsAnonymous(savedAnon === "true");
        setIsLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Save draft and redirect to login
            localStorage.setItem("need_draft_content", content);
            localStorage.setItem("need_draft_anon", String(isAnonymous));
            window.location.href = "/login?next=/need";
            return;
        }

        // Clear draft if it exists
        localStorage.removeItem("need_draft_content");
        localStorage.removeItem("need_draft_anon");

        // Submit via server action
        const formData = new FormData();
        formData.append("content", content);
        if (isAnonymous) formData.append("is_anonymous", "on");
        await submitNeed(formData);
    };

    if (isLoading) return null; // Or a loading spinner

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl z-10"
            >
                <div className="space-y-6 text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                        What do you need?
                    </h1>
                    <p className="text-xl text-muted-foreground font-light">
                        Describe it in your own words. No categories, no boxes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative bg-card border border-white/10 shadow-2xl rounded-2xl p-2 flex flex-col md:flex-row items-end gap-2">
                        <textarea
                            name="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="I need a winter coat for my 5-year-old..."
                            className="w-full bg-transparent border-none text-lg md:text-xl p-4 min-h-[120px] md:min-h-[80px] resize-none focus:ring-0 placeholder:text-muted-foreground/50"
                            required
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg mb-2 mr-2 shrink-0"
                        >
                            <ArrowUp className="h-6 w-6" />
                        </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                            <input
                                type="checkbox"
                                name="is_anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded border-border bg-transparent text-blue-600 focus:ring-blue-500/50"
                            />
                            Post Anonymously
                        </label>
                        <p className="text-xs text-muted-foreground/50">
                            (Login required to save request)
                        </p>
                    </div>
                </form>

                <div className="mt-8 flex justify-center gap-4 text-sm text-muted-foreground/60">
                    <span>Examples:</span>
                    <span className="hover:text-foreground cursor-pointer transition-colors">"Help moving a couch"</span>
                    <span>•</span>
                    <span className="hover:text-foreground cursor-pointer transition-colors">"Advice on gardening"</span>
                </div>
            </motion.div>
        </main>
    );
}
