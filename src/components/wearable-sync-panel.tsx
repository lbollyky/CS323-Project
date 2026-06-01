"use client";

import { useEffect, useRef, useTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Check,
  Loader2,
  RefreshCw,
  Unplug,
  Watch,
} from "lucide-react";
import {
  connectWearableDemo,
  disconnectWearable,
  syncWearables,
} from "@/app/track/actions";
import {
  WEARABLE_PROVIDERS,
  type WearableConnection,
  type WearableProvider,
} from "@/types/wearable";
import { cn } from "@/lib/utils";

const PROVIDER_ICONS: Record<WearableProvider, typeof Activity> = {
  oura: Activity,
  whoop: Activity,
  apple_health: Watch,
};

function formatSyncTime(iso: string | null): string {
  if (!iso) return "Never synced";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function labelFor(id: WearableProvider): string {
  return WEARABLE_PROVIDERS.find((p) => p.id === id)?.name ?? id;
}

function isWearableProvider(value: string | null): value is WearableProvider {
  return value === "oura" || value === "whoop" || value === "apple_health";
}

export function WearableSyncPanel({
  connections,
  oauthConfigured,
}: {
  connections: WearableConnection[];
  oauthConfigured: Record<WearableProvider, boolean>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connected = new Map(
    connections.map((c) => [c.provider, c] as const),
  );

  const wearableParam = searchParams.get("wearable");
  const modeParam = searchParams.get("mode");
  const connectedParam = searchParams.get("connected");
  const handledQueryRef = useRef<string | null>(null);

  // Handle OAuth redirect ?wearable=oura&connected=1 or ?wearable=oura&mode=demo
  useEffect(() => {
    if (!wearableParam && connectedParam !== "1") return;

    const queryKey = `${wearableParam ?? ""}|${modeParam ?? ""}|${connectedParam ?? ""}`;
    if (handledQueryRef.current === queryKey) return;
    handledQueryRef.current = queryKey;

    if (connectedParam === "1" && isWearableProvider(wearableParam)) {
      setMessage(`${labelFor(wearableParam)} connected.`);
      router.replace("/track");
      return;
    }

    if (isWearableProvider(wearableParam) && modeParam === "demo") {
      startTransition(async () => {
        const result = await connectWearableDemo(wearableParam);
        if (result.ok) {
          setMessage(`${labelFor(wearableParam)} linked (demo mode).`);
          router.replace("/track");
        } else {
          setError(result.error);
        }
      });
    }
  }, [wearableParam, modeParam, connectedParam, router]);

  function handleConnect(provider: WearableProvider) {
    setError(null);
    setMessage(null);

    if (oauthConfigured[provider]) {
      window.location.href = `/api/wearables/${provider === "apple_health" ? "apple" : provider}/connect`;
      return;
    }

    if (provider === "apple_health") {
      startTransition(async () => {
        const result = await connectWearableDemo("apple_health");
        if (result.ok) {
          setMessage(
            "Apple Watch linked. Metrics sync via Apple Health (demo until iOS app ships).",
          );
          router.refresh();
        } else {
          setError(result.error);
        }
      });
      return;
    }

    window.location.href = `/api/wearables/${provider}/connect`;
  }

  function handleDisconnect(provider: WearableProvider) {
    setError(null);
    startTransition(async () => {
      const result = await disconnectWearable(provider);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  function handleSyncAll() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await syncWearables();
      if (result.ok) {
        setMessage(
          result.synced?.length
            ? `Synced ${result.synced.map(labelFor).join(", ")} into today's log.`
            : "Synced into today's log.",
        );
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  const anyConnected = connections.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-background p-1">
      <div className="rounded-[14px] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Wearables
            </p>
            <h2 className="mt-1 text-[18px] font-medium tracking-tight">
              Sync Oura, Whoop, or Apple Watch
            </h2>
            <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
              Connect a device to pull HRV, resting heart rate, and sleep
              stages into today&rsquo;s log automatically.
            </p>
          </div>
          {anyConnected && (
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={pending}
              className="focus-ring inline-flex h-10 select-none items-center gap-2 rounded-xl bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync now
            </button>
          )}
        </div>

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-[12.5px] text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[12.5px] text-destructive">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {WEARABLE_PROVIDERS.map((p) => {
            const conn = connected.get(p.id);
            const isConnected = Boolean(conn);
            const Icon = PROVIDER_ICONS[p.id];

            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-xl border p-4 transition-colors",
                  isConnected
                    ? "border-foreground/20 bg-surface/50"
                    : "border-border bg-background",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {isConnected && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                      Linked
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[15px] font-medium">{p.name}</p>
                <p className="mt-1 flex-1 text-[12px] leading-snug text-muted-foreground">
                  {p.description}
                </p>
                {isConnected && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Last sync: {formatSyncTime(conn?.last_sync_at ?? null)}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(p.id)}
                      disabled={pending}
                      className="focus-ring inline-flex flex-1 select-none items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12.5px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-60"
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(p.id)}
                      disabled={pending}
                      className="focus-ring inline-flex flex-1 select-none items-center justify-center rounded-lg bg-foreground py-2 text-[12.5px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      Connect
                    </button>
                  )}
                </div>
                {!oauthConfigured[p.id] && p.id !== "apple_health" && !isConnected && (
                  <p className="mt-2 text-[10.5px] text-muted-foreground/80">
                    Demo sync — add OAuth keys in .env.local for live data.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
