"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { PRODUCTS } from "@/lib/products";

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
