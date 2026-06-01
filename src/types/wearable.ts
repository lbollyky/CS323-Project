export type WearableProvider = "oura" | "whoop" | "apple_health";

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  connected_at: string;
  last_sync_at: string | null;
}

export interface WearableMetrics {
  hrv_ms: number | null;
  resting_hr: number | null;
  rem_minutes: number | null;
  deep_minutes: number | null;
}

export interface WearableProviderInfo {
  id: WearableProvider;
  name: string;
  description: string;
}

export const WEARABLE_PROVIDERS: WearableProviderInfo[] = [
  {
    id: "oura",
    name: "Oura Ring",
    description: "Sleep stages, HRV, and readiness from your Oura account.",
  },
  {
    id: "whoop",
    name: "Whoop",
    description: "Recovery, strain, and sleep metrics from Whoop.",
  },
  {
    id: "apple_health",
    name: "Apple Watch",
    description: "Heart rate, HRV, and sleep from Apple Health.",
  },
];
