import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Pharmacist + product hero with two call-to-action buttons baked into the
 * artwork. We overlay transparent links positioned exactly over them:
 * "Shop protocols" → the shop, "Meet the team" → the clinician page.
 *
 * Used in the home-page trust block and on the clinician page.
 */
export function PharmacistTeamCta({
  className = "mx-auto w-full max-w-sm lg:max-w-none",
  sizes = "(min-width: 1024px) 480px, (min-width: 640px) 384px, 100vw",
}: {
  className?: string;
  sizes?: string;
} = {}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border",
        className,
      )}
    >
      <Image
        src="/products/pharmacist-team.png"
        alt="Pepwell protocols, formulated by clinical pharmacists in a cGMP-certified US pharmacy"
        width={816}
        height={1024}
        sizes={sizes}
        quality={100}
        priority
        className="h-auto w-full select-none"
      />

      {/* Shop protocols → shop */}
      <Link
        href="/shop"
        aria-label="Shop protocols"
        title="Shop protocols"
        className="focus-ring absolute rounded-full"
        style={{ left: "31.5%", top: "57.8%", width: "22%", height: "6.2%" }}
      />

      {/* Meet the team → clinician page */}
      <Link
        href="/clinician"
        aria-label="Meet the team"
        title="Meet the team"
        className="focus-ring absolute rounded-full"
        style={{ left: "54%", top: "57.8%", width: "15.5%", height: "6.2%" }}
      />
    </div>
  );
}
