
import LoginForm from "@/app/login/login-form";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next } = await searchParams;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] right-[20%] w-[60%] h-[60%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
            <LoginForm next={next || '/'} />
        </main>
    );
}
