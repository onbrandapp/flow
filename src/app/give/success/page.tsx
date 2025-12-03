import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export default function GiveSuccessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-center">
            <div className="space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-violet-500/10 rounded-full flex items-center justify-center">
                        <Gift className="h-12 w-12 text-violet-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-serif font-bold">Item Listed!</h1>
                <p className="text-muted-foreground">
                    Thank you for your generosity. We'll let you know when someone needs this.
                </p>
                <div className="pt-8 flex flex-col gap-3">
                    <Link href="/give">
                        <Button className="w-full">List Another Item</Button>
                    </Link>
                    <Link href="/feed">
                        <Button variant="ghost" className="w-full h-12 rounded-xl hover:bg-white/5">
                            View Community Feed
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
