"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PRODUCTS } from "@/lib/products";
import { expandProtocolIds } from "@/lib/track/load-track-data";
import {
  fetchAppleHealthMetrics,
  fetchOuraMetrics,
  fetchWhoopMetrics,
  mergeMetrics,
} from "@/lib/wearables/sync";
import type { WearableProvider } from "@/types/wearable";

const ALLOWED_PROTOCOL_IDS = new Set(
  PRODUCTS.filter((p) => !p.bundle_of).map((p) => p.id),
);

function parseScore(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function parseWearable(
  value: FormDataEntryValue | null,
  max: number,
): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(max, Math.round(n)));
}

function parseProtocols(values: FormDataEntryValue[]): string[] {
  return values
    .map((v) => String(v))
    .filter((id) => ALLOWED_PROTOCOL_IDS.has(id));
}

function parseText(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, 4000);
}

export type SaveLogResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveDailyLog(formData: FormData): Promise<SaveLogResult> {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/track");

  const log_date = (formData.get("log_date") as string) ||
    new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: user.id,
    log_date,
    protocols_taken: parseProtocols(formData.getAll("protocols_taken")),
    sleep_score: parseScore(formData.get("sleep_score")),
    energy_score: parseScore(formData.get("energy_score")),
    focus_score: parseScore(formData.get("focus_score")),
    mood_score: parseScore(formData.get("mood_score")),
    side_effects: parseText(formData.get("side_effects")),
    notes: parseText(formData.get("notes")),
    hrv_ms: parseWearable(formData.get("hrv_ms"), 300),
    resting_hr: parseWearable(formData.get("resting_hr"), 200),
    rem_minutes: parseWearable(formData.get("rem_minutes"), 600),
    deep_minutes: parseWearable(formData.get("deep_minutes"), 600),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_logs")
      .upsert(payload, { onConflict: "user_id,log_date" });
    if (error) {
      return { ok: false, error: error.message };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save the log.",
    };
  }

  revalidatePath("/track");
  return { ok: true };
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Best-effort sign out; nothing actionable on failure here.
  }
  redirect("/");
}

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveUserProtocol(input: {
  protocol_ids: string[];
  goal?: string | null;
  duration_weeks?: number | null;
}): Promise<ActionResult> {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/track");

  const ids = expandProtocolIds(
    input.protocol_ids.filter((id) =>
      PRODUCTS.some((p) => p.id === id),
    ),
  );

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("profiles")
      .select("protocol_started_at")
      .eq("id", user.id)
      .maybeSingle();

    const { error } = await supabase
      .from("profiles")
      .update({
        active_protocol_ids: ids,
        protocol_goal: input.goal?.trim() || null,
        protocol_duration_weeks: input.duration_weeks ?? null,
        protocol_started_at:
          existing?.protocol_started_at ??
          (ids.length > 0 ? new Date().toISOString().slice(0, 10) : null),
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not save protocol.",
    };
  }

  revalidatePath("/track");
  return { ok: true };
}

export async function connectWearableDemo(
  provider: WearableProvider,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/track");

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("wearable_connections").upsert(
      {
        user_id: user.id,
        provider,
        access_token: "demo",
        refresh_token: null,
        token_expires_at: null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    );
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not connect device.",
    };
  }

  revalidatePath("/track");
  return { ok: true };
}

export async function disconnectWearable(
  provider: WearableProvider,
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/track");

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("wearable_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not disconnect.",
    };
  }

  revalidatePath("/track");
  return { ok: true };
}

export async function syncWearables(): Promise<
  ActionResult & { synced?: WearableProvider[] }
> {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/track");

  const today = new Date().toISOString().slice(0, 10);

  try {
    const supabase = await createClient();
    const { data: connections, error: connError } = await supabase
      .from("wearable_connections")
      .select("provider, access_token")
      .eq("user_id", user.id);

    if (connError) return { ok: false, error: connError.message };
    if (!connections?.length) {
      return { ok: false, error: "Connect a wearable first." };
    }

    const syncedProviders = connections.map(
      (c) => c.provider as WearableProvider,
    );

    const metricSources = await Promise.all(
      connections.map(async (c) => {
        const token = c.access_token ?? "demo";
        switch (c.provider as WearableProvider) {
          case "oura":
            return fetchOuraMetrics(token, today);
          case "whoop":
            return fetchWhoopMetrics(token, today);
          case "apple_health":
            return fetchAppleHealthMetrics(token, today);
          default:
            return null;
        }
      }),
    );

    const merged = mergeMetrics(
      metricSources.filter((m): m is NonNullable<typeof m> => m != null),
    );

    const hasAny =
      merged.hrv_ms != null ||
      merged.resting_hr != null ||
      merged.rem_minutes != null ||
      merged.deep_minutes != null;

    if (!hasAny) {
      return {
        ok: false,
        error: "No metrics returned. Try again after your device syncs overnight data.",
      };
    }

    const { data: existingLog } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();

    const { error: logError } = await supabase.from("daily_logs").upsert(
      {
        user_id: user.id,
        log_date: today,
        protocols_taken: existingLog?.protocols_taken ?? [],
        sleep_score: existingLog?.sleep_score ?? null,
        energy_score: existingLog?.energy_score ?? null,
        focus_score: existingLog?.focus_score ?? null,
        mood_score: existingLog?.mood_score ?? null,
        side_effects: existingLog?.side_effects ?? null,
        notes: existingLog?.notes ?? null,
        hrv_ms: merged.hrv_ms,
        resting_hr: merged.resting_hr,
        rem_minutes: merged.rem_minutes,
        deep_minutes: merged.deep_minutes,
      },
      { onConflict: "user_id,log_date" },
    );

    if (logError) return { ok: false, error: logError.message };

    await supabase
      .from("wearable_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("user_id", user.id);

    revalidatePath("/track");
    return { ok: true, synced: syncedProviders };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Sync failed.",
    };
  }
}
