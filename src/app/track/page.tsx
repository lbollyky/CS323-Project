import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/components/site-nav";
import { TrackForm } from "@/components/track-form";
import { TrackHistory } from "@/components/track-history";
import { PRODUCTS } from "@/lib/products";
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
  const logs = await loadLogs(user.id);

  const today = todayISO();
  const todayLog = logs.find((l) => l.log_date === today) ?? null;
  const recent = logs.filter((l) => l.log_date !== today).slice(0, 14);

  const protocols = PRODUCTS.filter((p) => !p.bundle_of).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav user={user} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-12 sm:pt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Daily check-in
              </p>
              <h1 className="mt-2 text-[28px] font-medium tracking-tight sm:text-[32px]">
                {todayLog ? "Today, already logged." : "How was today?"}
              </h1>
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              {today} · signed in as {user.email}
            </p>
          </div>

          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
            Track which protocol you took, how you slept, energy, focus, mood,
            and (if you wear one) Oura / Whoop metrics. Most users report
            changes between weeks 2 and 6 — the trend is what matters.
          </p>

          <TrackForm
            today={today}
            existing={todayLog}
            protocols={protocols}
          />

          <TrackHistory logs={recent} protocols={protocols} />
        </div>
      </main>
    </div>
  );
}
