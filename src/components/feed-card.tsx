import { motion } from "framer-motion";
import { Heart, Gift, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startConversation } from "@/app/conversations/actions";
import { markItemComplete } from "@/app/feed/actions";
import { CheckCircle } from "lucide-react";

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
}

export function FeedCard({ item, currentUserId }: { item: FeedItem; currentUserId: string }) {
    const isNeed = item.type === 'need';
    const isOwner = item.user.id === currentUserId;

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
                        <p className="text-sm text-muted-foreground mt-1">
                            by {item.user.full_name || "Anonymous"} • <span className="opacity-70">{new Date(item.created_at).toLocaleDateString()}</span>
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

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-3">
                        {isOwner ? (
                            <form action={async () => {
                                "use server";
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
                                "use server";
                                await startConversation(item.id, item.type, item.user.id);
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
