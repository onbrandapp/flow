import { createClient } from "@/lib/supabase/server";
import { FeedCard, FeedItem } from "@/components/feed-card";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/login/actions";

export default async function FeedPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?next=/feed");
    }

    // Fetch Needs
    const { data: needs } = await supabase
        .from("needs")
        .select("*, profiles(id, full_name, avatar_url)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

    // Fetch Gives
    const { data: gives } = await supabase
        .from("gives")
        .select("*, profiles(id, full_name, avatar_url)")
        .eq("status", "available")
        .order("created_at", { ascending: false });

    // Combine and Sort
    const feedItems: FeedItem[] = [
        ...(needs?.map(n => ({
            id: n.id,
            type: 'need' as const,
            title: n.content,
            user: n.profiles,
            created_at: n.created_at,
            urgency: n.urgency,
            status: n.status
        })) || []),
        ...(gives?.map(g => ({
            id: g.id,
            type: 'give' as const,
            title: g.title,
            description: g.description,
            imageUrl: g.image_url,
            user: g.profiles,
            created_at: g.created_at,
            status: g.status
        })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <main className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />

            <div className="max-w-2xl mx-auto p-6 relative z-10">
                <header className="mb-8 pt-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-serif font-bold">Community Feed</h1>
                        <p className="text-muted-foreground">Discover needs and offers in your area.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/conversations">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MessageCircle className="h-6 w-6" />
                            </Button>
                        </Link>
                        <form action={async () => {
                            "use server";
                            await signOut();
                        }}>
                            <Button type="submit" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </header>

                <div className="space-y-6">
                    {feedItems.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p>No items yet. Be the first to post!</p>
                        </div>
                    ) : (
                        feedItems.map(item => (
                            <FeedCard key={item.id} item={item} currentUserId={user.id} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
