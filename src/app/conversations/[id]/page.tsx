import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { sendMessage } from "./actions";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch conversation details
    const { data: conversation } = await supabase
        .from("conversations")
        .select(`
            *,
            participant1:profiles!participant1_id(id, full_name, avatar_url),
            participant2:profiles!participant2_id(id, full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

    if (!conversation) {
        redirect("/feed");
    }

    // Determine other participant
    const otherParticipant = conversation.participant1_id === user.id
        ? conversation.participant2
        : conversation.participant1;

    // Fetch messages
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

    return (
        <main className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <Link href="/feed">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center font-bold text-foreground/80">
                        {otherParticipant.avatar_url ? (
                            <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            otherParticipant.full_name?.[0] || "?"
                        )}
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">{otherParticipant.full_name}</h1>
                        <p className="text-xs text-muted-foreground capitalize">{conversation.item_type}</p>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-muted text-foreground rounded-bl-none"
                                }`}>
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 ${isMe ? "text-blue-200" : "text-muted-foreground"}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {messages?.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Start the conversation!</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
                <form
                    action={async (formData) => {
                        "use server";
                        const content = formData.get("content") as string;
                        await sendMessage(id, content);
                    }}
                    className="flex gap-2"
                >
                    <input
                        name="content"
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-muted/50 border-none rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        autoComplete="off"
                        required
                    />
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shrink-0">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </main>
    );
}
