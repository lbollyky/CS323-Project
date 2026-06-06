import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { CartBadge } from "@/components/cart-badge";
import { SignOutForm } from "@/components/sign-out-form";
import { Wordmark } from "@/components/wordmark";

export function SiteNav({ user }: { user?: User | null }) {
  const isAuthed = Boolean(user);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" aria-label="Pepwell home" className="flex items-center">
          <Wordmark className="h-5" />
        </Link>

        <nav className="flex items-center gap-1 text-[13px]">
          <Link
            href="/shop"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          <Link
            href="/verify"
            className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Verify
          </Link>

          {isAuthed ? (
            <>
              <Link
                href="/guide"
                className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                Guide
              </Link>
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
