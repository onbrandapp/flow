"use client";

import { motion } from "framer-motion";
import { Heart, Gift, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startConversation } from "@/app/conversations/actions";
import { markItemComplete, toggleItemStatus, addInventoryItem } from "@/app/feed/actions";
import { CheckCircle, Plus } from "lucide-react";
import { useState } from "react";

export interface FeedItem {
    id: string;
    type: 'need' | 'give';
    title: string; // Content for needs, Title for gives
    description?: string; // For gives
    imageUrl?: string; // For gives
    user: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
    created_at: string;
    urgency?: string; // For needs
    status: string;
    inventory?: { name: string, status: 'available' | 'taken' }[]; // For gives (AI extracted)
}

export function FeedCard({ item, currentUserId }: { item: FeedItem; currentUserId: string }) {
    const isNeed = item.type === 'need';
    const isOwner = item.user.id === currentUserId;
    const [newItemName, setNewItemName] = useState("");
    const [isAddingItem, setIsAddingItem] = useState(false);

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-card/50 backdrop-blur-md border border-white/10 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Type Indicator */}
            <div className={cn(
                "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                isNeed ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
            )}>
                {isNeed ? "Request" : "Offer"}
            </div>

            <div className="flex items-start gap-4">
                {/* User Avatar (Placeholder if none) */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-sm font-bold text-foreground/80 shrink-0">
                    {item.user.avatar_url ? (
                        <img src={item.user.avatar_url} alt={item.user.full_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        item.user.full_name?.[0] || "?"
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div>
                        <h3 className="text-lg font-serif font-semibold leading-tight">
                            {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                            <span>by {item.user.full_name || "Anonymous"}</span>
                            <span className="hidden sm:inline mx-1">•</span>
                            <span className="opacity-70 text-xs sm:text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>

                    {/* Image for Gives */}
                    {!isNeed && item.imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/50 mt-3">
                            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                    )}

                    {/* Description for Gives */}
                    {!isNeed && item.description && (
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {item.description}
                        </p>
                    )}

                    {/* AI Inventory for Gives */}

                    {/* AI Inventory for Gives */}
                    {!isNeed && item.inventory && (
                        <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {item.inventory.map((invItem, i) => (
                                    isOwner ? (
                                        <form key={i} action={async () => {
                                            await toggleItemStatus(item.id, i);
                                        }}>
                                            <button
                                                type="submit"
                                                className={cn(
                                                    "px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-md border transition-all cursor-pointer hover:opacity-80",
                                                    invItem.status === 'taken'
                                                        ? "bg-muted text-muted-foreground border-transparent line-through decoration-muted-foreground/50"
                                                        : "bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20"
                                                )}
                                                title="Click to toggle status"
                                            >
                                                {invItem.name}
                                            </button>
                                        </form>
                                    ) : (
                                        <span key={i} className={cn(
                                            "px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-md border transition-colors",
                                            invItem.status === 'taken'
                                                ? "bg-muted text-muted-foreground border-transparent line-through decoration-muted-foreground/50"
                                                : "bg-violet-500/10 text-violet-300 border-violet-500/20"
                                        )}>
                                            {invItem.name}
                                        </span>
                                    )
                                ))}

                                {isOwner && (
                                    <div className="flex items-center">
                                        {isAddingItem ? (
                                            <form action={async (formData) => {
                                                const name = formData.get('name') as string;
                                                if (name) {
                                                    await addInventoryItem(item.id, name);
                                                    setIsAddingItem(false);
                                                    setNewItemName("");
                                                }
                                            }} className="flex items-center gap-1">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    placeholder="Add item..."
                                                    className="h-6 w-24 rounded-md border border-white/10 bg-black/20 px-2 text-[10px] text-foreground focus:outline-none focus:border-violet-500/50"
                                                    autoFocus
                                                    onBlur={() => !newItemName && setIsAddingItem(false)}
                                                />
                                                <button type="submit" className="hidden" />
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setIsAddingItem(true)}
                                                className="px-2 py-1 flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium rounded-md border border-dashed border-white/20 text-muted-foreground hover:text-foreground hover:border-white/40 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" /> Add
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-3">
                        {isOwner ? (
                            <form action={async () => {
                                await markItemComplete(item.id, item.type);
                            }} className="flex-1">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full rounded-xl h-10 border-white/10 hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50 transition-all cursor-pointer"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Complete
                                </Button>
                            </form>
                        ) : (
                            <form action={async () => {
                                await startConversation(item.id, item.user.id, item.type);
                            }} className="flex-1">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className={cn(
                                        "w-full rounded-xl h-10 border-white/10 hover:bg-white/5",
                                        isNeed ? "text-orange-500 hover:text-orange-400" : "text-blue-500 hover:text-blue-400"
                                    )}
                                >
                                    {isNeed ? (
                                        <>
                                            <Heart className="mr-2 h-4 w-4" />
                                            I can help
                                        </>
                                    ) : (
                                        <>
                                            <Gift className="mr-2 h-4 w-4" />
                                            I need this
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
