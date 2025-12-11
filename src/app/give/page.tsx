"use client";

import { motion } from "framer-motion";
import { Camera, Upload, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitGive } from "@/app/give/actions";
import { useState, useRef } from "react";

export default function GivePage() {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="space-y-6 text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-foreground">
                        What can you give?
                    </h1>
                    <p className="text-muted-foreground">
                        Snap a photo or upload. We'll handle the rest.
                    </p>
                </div>

                <form action={submitGive} className="space-y-4 bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl">

                    {/* Image Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative h-48 w-full rounded-2xl border-2 border-dashed border-muted-foreground/25 hover:border-blue-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center bg-background/50 overflow-hidden group"
                    >
                        <input
                            type="file"
                            name="image"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                            required
                        />

                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center space-y-2 group-hover:scale-105 transition-transform">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                                    <Camera className="h-6 w-6 text-blue-500" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">Snap a photo or upload</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <input
                            name="title"
                            type="text"
                            placeholder="What is it? (e.g., Vintage Lamp)"
                            className="w-full bg-transparent border-b border-border px-0 py-2 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-muted-foreground/50"
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Any details? (e.g., Works perfectly, just needs a bulb)"
                            className="w-full bg-transparent border-b border-border px-0 py-2 text-base min-h-[60px] resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder:text-muted-foreground/50"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    >
                        <Upload className="mr-2 h-5 w-5" />
                        List Item
                    </Button>
                </form>
            </motion.div>
        </main>
    );
}
