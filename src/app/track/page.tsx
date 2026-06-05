import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/components/site-nav";
import { ContactProviderButton } from "@/components/contact-provider-button";
import { ProtocolHeader } from "@/components/protocol-header";
import { WearableSyncSection } from "@/components/wearable-sync-section";
import { TrackForm } from "@/components/track-form";
import { TrackHistory } from "@/components/track-history";
import { PRODUCTS } from "@/lib/products";
import {
  expandProtocolIds,
  isWearableOAuthConfigured,
  loadUserProtocol,
  loadWearableConnections,
} from "@/lib/track/load-track-data";
import type { DailyLog } from "@/types/track";

export const metadata = {
  title: "Track — Pepwell",
  description: "Your daily check-in and the last fourteen days at a glance.",
};

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadLogs(userId: string): Promise<DailyLog[]> {
  try {
    const supabase = await createClient();
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", since.toISOString().slice(0, 10))
      .order("log_date", { ascending: false });
    if (error || !data) return [];
    return data as DailyLog[];
  } catch {
    return [];
  }
}

export default async function TrackPage() {
  const user = await requireUser("/track");
  const [logs, userProtocol, connections] = await Promise.all([
    loadLogs(user.id),
    loadUserProtocol(user.id),
    loadWearableConnections(user.id),
  ]);

  const today = todayISO();
  const todayLog = logs.find((l) => l.log_date === today) ?? null;
  const recent = logs.filter((l) => l.log_date !== today).slice(0, 14);

  const protocols = PRODUCTS.filter((p) => !p.bundle_of).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const defaultProtocolIds = expandProtocolIds(
    userProtocol?.active_protocol_ids ?? [],
  );

  const oauthConfigured = {
    oura: isWearableOAuthConfigured("oura"),
    whoop: isWearableOAuthConfigured("whoop"),
    apple_health: false,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav user={user} />
      <main className="relative flex-1">
        {/* Ambient color wash so the dashboard reads as part of an
            intentional palette rather than a flat white sheet. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] overflow-hidden"
        >
          <div
            className="absolute -left-32 -top-24 h-80 w-80 rounded-full blur-[90px]"
            style={{ background: "oklch(0.62 0.18 280 / 0.16)" }}
          />
          <div
            className="absolute left-1/3 -top-16 h-72 w-72 rounded-full blur-[90px]"
            style={{ background: "oklch(0.66 0.16 40 / 0.12)" }}
          />
          <div
            className="absolute right-0 top-8 h-80 w-80 rounded-full blur-[90px]"
            style={{ background: "oklch(0.6 0.15 215 / 0.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-12 sm:pt-16">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "oklch(0.55 0.22 260)" }}
              />
              Your dashboard
            </p>
            <ContactProviderButton />
          </div>

          <ProtocolHeader protocol={userProtocol} />

          <div className="mt-6">
            <WearableSyncSection
              connections={connections}
              oauthConfigured={oauthConfigured}
            />
          </div>

          {/* Two-column workspace: today's check-in on the left,
              running history on the right. Stacks on small screens. */}
          <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-2">
            {/* Daily check-in */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Daily check-in
                  </p>
                  <h1 className="mt-2 text-[28px] font-medium tracking-tight sm:text-[32px]">
                    {todayLog ? "Today, already logged." : "How was today?"}
                  </h1>
                </div>
                <p className="text-[12.5px] text-muted-foreground">{today}</p>
              </div>

              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Log how you felt today. Your protocol is pre-selected; wearable
                metrics fill in when you sync above.
              </p>

              <div className="mt-6">
                <TrackForm
                  today={today}
                  existing={todayLog}
                  protocols={protocols}
                  defaultProtocolIds={defaultProtocolIds}
                />
              </div>
            </div>

            {/* History */}
            <div>
              <TrackHistory
                logs={recent}
                todayLog={todayLog}
                protocols={protocols}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
