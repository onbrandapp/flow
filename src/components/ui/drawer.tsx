"use client";

import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when drawer is open
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e: any, info: PanInfo) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 lg:hidden min-h-[40vh] max-h-[85vh] overflow-y-auto shadow-2xl safe-area-bottom"
                    >
                        {/* Handle for dragging visual cue */}
                        <div className="w-12 h-1.5 bg-slate-700/50 rounded-full mx-auto mb-8 cursor-grab active:cursor-grabbing" />

                        {title && (
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold font-serif text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        <div className="relative">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
