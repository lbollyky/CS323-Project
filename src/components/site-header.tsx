import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/safe";
import { SignOutButton } from "@/components/sign-out-button";
import { CartButton } from "@/components/cart-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; href: string; hasMenu?: boolean }[] = [
  { label: "Protocols", href: "/products", hasMenu: true },
  { label: "Biomarkers", href: "/products?category=foundational" },
  { label: "How It Works", href: "/#how-it-works" },
];

export async function SiteHeader({
  variant = "default",
}: {
  variant?: "default" | "transparent";
}) {
  const user = await getCurrentUser();

  const isTransparent = variant === "transparent";
  const linkBase = isTransparent
    ? "text-white/75 hover:text-white"
    : "text-foreground/65 hover:text-foreground";

  return (
    <header
      className={cn(
        "z-50 w-full",
        isTransparent
          ? "absolute top-0 left-0 right-0"
          : "sticky top-0 border-b border-border/60 glass-light",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* ─── Brand + nav (left cluster) ─── */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-1.5">
            <Logomark inverted={isTransparent} />
            <span
              className={cn(
                "text-[15px] font-semibold tracking-tight",
                isTransparent ? "text-white" : "text-foreground",
              )}
            >
              medicine
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  linkBase,
                )}
              >
                {item.label}
                {item.hasMenu && (
                  <ChevronDown className="h-3 w-3 opacity-60" />
                )}
              </Link>
            ))}
            <Link
              href="/intake"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                linkBase,
              )}
            >
              Gift
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                15% off
              </span>
            </Link>
          </nav>
        </div>

        {/* ─── Account + cart (right cluster) ─── */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 rounded-full text-[13px]",
                    isTransparent
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "",
                  )}
                >
                  Dashboard
                </Button>
              </Link>
              <CartButton variant={variant} />
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "hidden h-9 items-center rounded-full px-3 text-[13px] font-medium transition-colors sm:inline-flex",
                  linkBase,
                )}
              >
                Login
              </Link>
              <CartButton variant={variant} />
              <Link href="/intake" className="ml-1">
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-primary px-4 text-[13px] font-semibold shadow-none hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Logomark({ inverted }: { inverted: boolean }) {
  const stroke = inverted ? "white" : "currentColor";
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={inverted ? "text-white" : "text-primary"}
      aria-hidden
    >
      <path
        d="M12 2.5L13.7 8.3L19.5 10L13.7 11.7L12 17.5L10.3 11.7L4.5 10L10.3 8.3L12 2.5Z"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="20" r="1.4" fill={stroke} />
    </svg>
  );
}
