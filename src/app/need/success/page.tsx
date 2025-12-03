import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function NeedSuccessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-center">
            <div className="space-y-6 max-w-md">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                </div>
                <h1 className="text-3xl font-serif font-bold">Request Received</h1>
                <p className="text-muted-foreground">
                    We've shared your need with the community. We'll notify you when someone can help.
                </p>
                <div className="pt-8">
                    <Link href="/feed">
                        <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5">
                            View Community Feed
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
