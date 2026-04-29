import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseAvailable,
  getProducts,
  getCurrentUser,
} from "@/lib/supabase/safe";
import { SiteHeader } from "@/components/site-header";
import { DailyLogForm } from "@/components/dashboard/daily-log-form";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { ProtocolCard } from "@/components/dashboard/protocol-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Watch } from "lucide-react";
import type { Product } from "@/types/database";

export default async function DashboardPage() {
  const liveBackend = await isSupabaseAvailable();
  const user = await getCurrentUser();

  // When the live DB is up, require a real session.
  if (liveBackend && !user) {
    redirect("/login");
  }

  const allProducts: Product[] = await getProducts();

  // Demo profile when running on mock data
  const demoUser = {
    id: "demo-user",
    email: "demo@medicine.com",
    user_metadata: { name: "Alex" },
  } as const;
  const sessionUser = user ?? demoUser;

  let protocolIds: string[] = [];
  if (liveBackend && user) {
    try {
      const supabase = await createClient();
      const { data: userData } = await supabase
        .from("users")
        .select("goal_profile")
        .eq("id", user.id)
        .maybeSingle();
      protocolIds = userData?.goal_profile?.protocol_product_ids ?? [];
    } catch {
      protocolIds = [];
    }
  } else {
    // Demo protocol — show a few representative peptides
    protocolIds = allProducts.slice(0, 3).map((p) => p.id);
  }

  const protocolProducts =
    protocolIds.length > 0
      ? allProducts.filter((p) => protocolIds.includes(p.id))
      : [];

  const firstName =
    sessionUser.user_metadata?.name?.split(" ")[0] ||
    sessionUser.email?.split("@")[0] ||
    "there";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 17
                  ? "afternoon"
                  : "evening"}
              , {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            {/* Left column — daily log */}
            <div className="lg:col-span-3">
              <DailyLogForm userId={sessionUser.id} products={allProducts} />
            </div>

            {/* Right column — insights, protocol, wearable */}
            <div className="space-y-6 lg:col-span-2">
              <InsightsCard />
              <ProtocolCard products={protocolProducts} />

              {/* Wearable placeholder */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Watch className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Wearable Data</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync heart rate, sleep, and activity from your
                    devices.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled
                  >
                    Connect Wearable
                  </Button>
                  <p className="mt-2 text-[0.7rem] text-muted-foreground/50">
                    Apple Health, Oura, Whoop — coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
