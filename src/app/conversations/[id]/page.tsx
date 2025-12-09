"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { sendMessage } from "./actions";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
}

interface ConversationPageProps {
    params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newItem, setNewItem] = useState<{ title: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unwrapParams = async () => {
            const resolvedParams = await params;
            setConversationId(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUserId(user.uid);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        // Fetch Conversation Details (for item title)
        const fetchDetails = async () => {
            const docRef = doc(db, "conversations", conversationId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setNewItem({ title: docSnap.data().item_title });
            }
        };
        fetchDetails();

        // Real-time Messages Listener
        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("created_at", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];
            setMessages(msgs);

            // Scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        });

        return () => unsubscribe();
    }, [conversationId]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="p-4 border-b border-white/10 flex items-center gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <Link href="/conversations">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-serif font-bold text-lg">
                        {newItem?.title || "Loading..."}
                    </h1>
                    <p className="text-xs text-muted-foreground">Conversation</p>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe
                                        ? "bg-foreground text-background rounded-tr-none"
                                        : "bg-white/10 border border-white/10 rounded-tl-none"
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <span className="text-[10px] opacity-50 mt-1 block">
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-background/80 backdrop-blur-md">
                <form
                    action={async (formData) => {
                        if (!conversationId) return;
                        await sendMessage(conversationId, formData);
                    }}
                    className="flex gap-2 max-w-2xl mx-auto"
                >
                    <input
                        name="content"
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" className="rounded-full h-12 w-12 shrink-0">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
