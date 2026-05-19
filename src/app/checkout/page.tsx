import { SiteNav } from "@/components/site-nav";
import { CheckoutClient } from "@/components/checkout-client";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Checkout — Pepwell",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getUser();
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav user={user} />
      <main className="flex-1">
        <CheckoutClient />
      </main>
    </div>
  );
}
