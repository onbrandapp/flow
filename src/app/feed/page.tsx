import { db } from "@/lib/firebase/admin";
import { FeedCard, FeedItem } from "@/components/feed-card";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase/admin";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/mobile-nav";

export default async function FeedPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
        redirect("/login?next=/feed");
    }

    let currentUser;
    try {
        currentUser = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        redirect("/login?next=/feed");
    }

    // Fetch Needs
    const needsSnapshot = await db.collection("needs")
        .where("status", "==", "open")
        .orderBy("created_at", "desc")
        .get();

    const needs = needsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Fetch Gives
    const givesSnapshot = await db.collection("gives")
        .where("status", "==", "available")
        .orderBy("created_at", "desc")
        .get();

    const gives = givesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Combine and Sort
    const feedItems: FeedItem[] = [
        ...(needs.map((n: any) => ({
            id: n.id,
            type: 'need' as const,
            title: n.content,
            user: {
                id: n.user_id,
                full_name: n.user_profile?.full_name || 'Anonymous',
                avatar_url: n.user_profile?.avatar_url
            },
            created_at: n.created_at,
            urgency: n.urgency,
            status: n.status
        }))),
        ...(gives.map((g: any) => ({
            id: g.id,
            type: 'give' as const,
            title: g.title,
            description: g.description,
            imageUrl: g.image_url,
            user: {
                id: g.user_id,
                full_name: g.user_profile?.full_name || 'Anonymous',
                avatar_url: g.user_profile?.avatar_url
            },
            created_at: g.created_at,
            status: g.status,
            inventory: g.inventory // Firestore now returns objects, so this passes through correctly
        })))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <main className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

            <div className="max-w-2xl mx-auto p-6 relative z-10">
                <header className="mb-8 pt-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif font-bold">Community Feed</h1>
                        <p className="text-muted-foreground">Discover needs and offers in your area.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="/">
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <Home className="h-6 w-6" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Go Home</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="/conversations">
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <MessageCircle className="h-6 w-6" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Messages</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <form action={async () => {
                                            "use server";
                                            await signOut();
                                        }}>
                                            <Button type="submit" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive">
                                                <LogOut className="h-5 w-5" />
                                            </Button>
                                        </form>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sign Out</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Mobile Nav */}
                        <MobileNav />
                    </div>
                </header>

                <div className="space-y-6">
                    {feedItems.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No items yet. Be the first to post!</p>
                        </div>
                    ) : (
                        feedItems.map(item => (
                            <FeedCard key={item.id} item={item} currentUserId={currentUser.uid} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
