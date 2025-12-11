"use client";

import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Menu, Home, MessageCircle, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-foreground/80 hover:text-foreground"
                onClick={() => setIsOpen(true)}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
            </Button>

            <Drawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Menu"
            >
                <nav className="flex flex-col gap-2">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl">
                            <Home className="mr-4 h-5 w-5" />
                            Home
                        </Button>
                    </Link>

                    <Link href="/conversations" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start h-12 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl">
                            <MessageCircle className="mr-4 h-5 w-5" />
                            Messages
                        </Button>
                    </Link>

                    <div className="h-px bg-slate-800 my-2" />

                    <form action={handleSignOut}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start h-12 text-lg font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl"
                        >
                            <LogOut className="mr-4 h-5 w-5" />
                            Sign Out
                        </Button>
                    </form>
                </nav>
            </Drawer>
        </div>
    );
}
