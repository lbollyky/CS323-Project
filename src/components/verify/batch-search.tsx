"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ShieldQuestion } from "lucide-react";
import { searchBatches, type Batch } from "@/lib/batches";
import { BatchCard } from "@/components/verify/batch-card";

/**
 * Lot-number search island for `/verify`. Lifts the typed query into the
 * URL (`?lot=`) so a customer-service rep can paste a link straight to a
 * specific batch and it stays linkable / shareable.
 */
export function BatchSearch({ initialLot }: { initialLot?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialLot ?? "");

  // Keep local input in sync if the URL changes (back/forward navigation).
  useEffect(() => {
    const fromUrl = params.get("lot") ?? "";
    if (fromUrl !== query) setQuery(fromUrl);
    // We intentionally only react to URL changes — typing is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Debounced URL sync so we don't push history on every keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = query.trim();
      const next = new URLSearchParams(params.toString());
      if (trimmed) next.set("lot", trimmed);
      else next.delete("lot");
      const nextStr = next.toString();
      const currentStr = params.toString();
      if (nextStr !== currentStr) {
        router.replace(nextStr ? `/verify?${nextStr}` : "/verify", {
          scroll: false,
        });
      }
    }, 250);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const matches: Batch[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchBatches(query);
  }, [query]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;
  const noMatches = hasQuery && matches.length === 0;

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          aria-label="Lot number"
          placeholder="Enter lot number — e.g. EPI-2026-031"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          className="h-14 w-full rounded-2xl border border-border bg-background px-14 font-mono text-[15px] tracking-wide text-foreground shadow-sm outline-none transition-all placeholder:font-mono placeholder:text-[13.5px] placeholder:tracking-wide placeholder:text-muted-foreground/80 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Clear lot search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <p className="mt-2 px-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        Lot is printed on the side of every vial — three letters, year, batch.
      </p>

      {hasQuery && (
        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              Match{matches.length === 1 ? "" : "es"} for{" "}
              <span className="text-foreground">{trimmed}</span>
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
              {matches.length} found
            </p>
          </div>

          {noMatches ? <NoMatch query={trimmed} /> : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {matches.map((b) => (
                <BatchCard key={b.lot} batch={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoMatch({ query }: { query: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-5">
      <ShieldQuestion className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="text-[13px] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">
          No batch on file for {`"${query}"`}.
        </p>
        <p className="mt-1">
          Double-check the characters on your vial — the format is three
          letters, the year, and a three-digit batch number (for example,{" "}
          <span className="font-mono text-foreground">EPI-2026-031</span>). If
          it still does not appear, email{" "}
          <a
            href="mailto:trust@pepwell.app"
            className="text-foreground underline-offset-4 hover:underline"
          >
            trust@pepwell.app
          </a>{" "}
          and we will trace it inside one business day.
        </p>
      </div>
    </div>
  );
}
