import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function InboxPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch conversations
    const { data: conversations } = await supabase
        .from("conversations")
        .select(`
            *,
            participant1:profiles!participant1_id(full_name, avatar_url),
            participant2:profiles!participant2_id(full_name, avatar_url),
            messages(content, created_at, is_read)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-2xl mx-auto p-6 relative z-10">
                <header className="mb-8 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/feed">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-serif font-bold">Messages</h1>
                    </div>
                </header>

                <div className="space-y-4">
                    {conversations?.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No messages yet.</p>
                            <p className="text-sm">Start a conversation from the Feed!</p>
                        </div>
                    ) : (
                        conversations?.map((conv) => {
                            const otherParticipant = conv.participant1_id === user.id ? conv.participant2 : conv.participant1;
                            const lastMessage = conv.messages?.[conv.messages.length - 1]; // Naive last message
                            // Ideally we'd order messages in the query, but Supabase nested ordering is tricky. 
                            // For MVP, let's assume the array order or just take the last one if we sort in JS.
                            // Actually, let's just show the conversation partner for now.

                            return (
                                <Link key={conv.id} href={`/conversations/${conv.id}`}>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center font-bold text-foreground/80 shrink-0">
                                            {otherParticipant.avatar_url ? (
                                                <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                otherParticipant.full_name?.[0] || "?"
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold truncate">{otherParticipant.full_name}</h3>
                                                {lastMessage && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(lastMessage.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {lastMessage ? lastMessage.content : "Start chatting..."}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
