"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/track";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            redirect,
          )}`,
          data: { name },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // When email confirmation is OFF in Supabase, signUp returns a session
      // immediately and we can route straight to /track. When it's ON, we
      // need the user to click the confirm link first.
      if (data.session) {
        router.push(redirect);
        router.refresh();
        return;
      }

      setNeedsConfirm(true);
      setLoading(false);
    } catch {
      setError(
        "Auth backend isn't configured for this demo. Check Supabase keys in .env.local.",
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
          Create an account
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          So you can log your daily check-in and watch the trend over weeks.
        </p>

        {needsConfirm ? (
          <div className="mt-8 rounded-xl border border-border bg-background p-5">
            <p className="text-[13.5px] text-foreground">
              Check your inbox for a confirmation link at{" "}
              <span className="font-medium">{email}</span>. Once you confirm,
              you&rsquo;ll be signed in and dropped into your tracker.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex text-[12.5px] text-muted-foreground underline-offset-4 hover:underline"
            >
              Already confirmed? Sign in →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="mt-8 flex flex-col gap-3">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[12.5px] text-destructive">
                {error}
              </div>
            )}
            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              required
              placeholder="Your name"
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="you@example.com"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              placeholder="At least 8 characters"
              minLength={8}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-foreground text-[13.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="mt-3 text-center text-[12.5px] text-muted-foreground">
              Have an account already?{" "}
              <Link
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  placeholder,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
      />
    </label>
  );
}
