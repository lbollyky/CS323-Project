import { createClient } from "@/lib/supabase/server";
import { PRODUCTS } from "@/lib/products";
import type { UserProtocol } from "@/types/user-protocol";
import type { WearableConnection, WearableProvider } from "@/types/wearable";

export async function loadUserProtocol(
  userId: string,
): Promise<UserProtocol | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "active_protocol_ids, protocol_goal, protocol_duration_weeks, protocol_started_at",
      )
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      active_protocol_ids: data.active_protocol_ids ?? [],
      protocol_goal: data.protocol_goal ?? null,
      protocol_duration_weeks: data.protocol_duration_weeks ?? null,
      protocol_started_at: data.protocol_started_at ?? null,
    };
  } catch {
    return null;
  }
}

export async function loadWearableConnections(
  userId: string,
): Promise<WearableConnection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wearable_connections")
      .select("id, user_id, provider, connected_at, last_sync_at")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data as WearableConnection[];
  } catch {
    return [];
  }
}

/** Expand bundle ids into the single-product ids the track form uses. */
export function expandProtocolIds(ids: string[]): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (product?.bundle_of) {
      for (const childId of product.bundle_of) {
        if (!PRODUCTS.find((p) => p.id === childId)?.bundle_of) {
          out.add(childId);
        }
      }
    } else if (product && !product.bundle_of) {
      out.add(id);
    }
  }
  return [...out];
}

export function isWearableOAuthConfigured(provider: WearableProvider): boolean {
  switch (provider) {
    case "oura":
      return Boolean(
        process.env.OURA_CLIENT_ID && process.env.OURA_CLIENT_SECRET,
      );
    case "whoop":
      return Boolean(
        process.env.WHOOP_CLIENT_ID && process.env.WHOOP_CLIENT_SECRET,
      );
    case "apple_health":
      return false;
  }
}
