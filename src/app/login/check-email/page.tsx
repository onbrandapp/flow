import { Mail } from "lucide-react";

export default function CheckEmailPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-center">
            <div className="space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Mail className="h-10 w-10 text-blue-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-serif font-bold">Check your email</h1>
                <p className="text-muted-foreground">
                    We've sent you a magic link to sign in.
                </p>
            </div>
        </main>
    );
}
