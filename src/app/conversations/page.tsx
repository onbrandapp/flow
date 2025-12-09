import { db, auth } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

export default async function InboxPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
        redirect("/login");
    }

    let currentUser;
    try {
        currentUser = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        redirect("/login");
    }

    // Fetch conversations where current user is a participant
    // Firestore array-contains query
    const conversationsSnapshot = await db.collection("conversations")
        .where("participants", "array-contains", currentUser.uid)
        .orderBy("updated_at", "desc")
        .get();

    const conversations = conversationsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return (
        <main className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

            <div className="max-w-2xl mx-auto p-6 relative z-10">
                <header className="mb-8 pt-4 flex items-center gap-4">
                    <Link href="/feed">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-serif font-bold">Messages</h1>
                        <p className="text-muted-foreground">Your active conversations.</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {conversations.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No conversations yet.</p>
                            <Link href="/feed">
                                <Button variant="link" className="mt-2">Browse the feed</Button>
                            </Link>
                        </div>
                    ) : (
                        conversations.map((conv: any) => (
                            <Link key={conv.id} href={`/conversations/${conv.id}`}>
                                <div className="bg-card/50 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                            {conv.item_title}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(conv.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {conv.last_message || "No messages yet"}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
