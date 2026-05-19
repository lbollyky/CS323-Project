import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { CartBadge } from "@/components/cart-badge";
import { SignOutForm } from "@/components/sign-out-form";

export function SiteNav({ user }: { user?: User | null }) {
  const isAuthed = Boolean(user);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-baseline gap-0.5 text-[15px] font-medium tracking-tight text-foreground"
        >
          <span>pep</span>
          <span className="text-muted-foreground">well</span>
          <span className="ml-0.5 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-foreground" />
        </Link>

        <nav className="flex items-center gap-1 text-[13px]">
          <Link
            href="/shop"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>

          {isAuthed ? (
            <>
              <Link
                href="/track"
                className="rounded-full px-3 py-1.5 text-foreground transition-colors hover:text-foreground"
              >
                Track
              </Link>
              <CartBadge />
              <SignOutForm />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="ml-1 inline-flex h-8 items-center rounded-full bg-foreground px-3 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90"
              >
                Sign up
              </Link>
              <CartBadge />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
