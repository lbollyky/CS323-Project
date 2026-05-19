"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError(
        "Auth backend isn't configured for this demo. The shop and AI guide are open — head back home.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-foreground">
      <Link
        href="/"
        className="absolute left-5 top-5 inline-flex items-center gap-1 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="flex items-baseline gap-0.5 text-[15px] font-medium tracking-tight"
        >
          <span>pep</span>
          <span className="text-muted-foreground">well</span>
          <span className="ml-0.5 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-foreground" />
        </Link>

        <h1 className="mt-10 text-[24px] font-medium tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Members only. New here? You can skip this and{" "}
          <Link href="/shop" className="text-foreground underline-offset-4 hover:underline">
            shop directly
          </Link>{" "}
          or{" "}
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            talk to the guide
          </Link>
          .
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-3">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[12.5px] text-destructive">
              {error}
            </div>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 rounded-lg border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-lg border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-foreground text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
