"use client";

import { Suspense } from "react";
import { WearableSyncPanel } from "@/components/wearable-sync-panel";
import type { WearableConnection, WearableProvider } from "@/types/wearable";

export function WearableSyncSection({
  connections,
  oauthConfigured,
}: {
  connections: WearableConnection[];
  oauthConfigured: Record<WearableProvider, boolean>;
}) {
  return (
    <Suspense fallback={null}>
      <WearableSyncPanel
        connections={connections}
        oauthConfigured={oauthConfigured}
      />
    </Suspense>
  );
}
