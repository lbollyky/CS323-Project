import { createClient as createServerSupabase } from "./server";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/types/database";

/* ────────────────────────────────────────────────────────────
   Resilient Supabase access.

   The dev environment may not have a live Supabase project
   (paused, deleted, or unconfigured). Without these helpers
   every server query hangs for ~25 s on auth-token refresh.

   `isSupabaseAvailable()` does ONE quick HEAD probe per
   process (1.5 s budget) and caches the result for 60 s.
   Every consumer should go through `getProducts()` etc. so
   that pages render with mock data when the project is down.
   ──────────────────────────────────────────────────────────── */

type Health = "unknown" | "ok" | "down";
let health: Health = "unknown";
let lastCheck = 0;
let warned = false;
const TTL_MS = 60_000;
const PROBE_TIMEOUT_MS = 1500;

function envConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your_supabase") &&
      !key.includes("your_supabase"),
  );
}

async function probe(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), PROBE_TIMEOUT_MS);
    const res = await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      signal: ctl.signal,
      headers: { apikey: key },
      cache: "no-store",
    });
    clearTimeout(t);
    // 200 / 401 / 404 all indicate the host is reachable
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

export async function isSupabaseAvailable(): Promise<boolean> {
  if (!envConfigured()) {
    if (!warned) {
      console.warn(
        "\n[medicine] Supabase not configured. Falling back to mock data.\n" +
          "          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.\n",
      );
      warned = true;
    }
    return false;
  }

  const now = Date.now();
  if (health !== "unknown" && now - lastCheck < TTL_MS) {
    return health === "ok";
  }

  const ok = await probe();
  health = ok ? "ok" : "down";
  lastCheck = now;

  if (!ok && !warned) {
    console.warn(
      "\n[medicine] Supabase project unreachable (DNS/timeout). Falling back to mock data.\n" +
        `          Project URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n` +
        "          Free-tier projects are paused after ~7 days of inactivity. Create a fresh project at https://supabase.com\n" +
        "          and run supabase/schema.sql + migration-002-categories.sql + migration-003-wellness-catalog.sql to restore live data.\n",
    );
    warned = true;
  }
  return ok;
}

/* Force re-probe — useful if env vars changed */
export function resetSupabaseHealth() {
  health = "unknown";
  lastCheck = 0;
  warned = false;
}

/* ─── Safe data accessors ────────────────────────────────── */

export async function getProducts(): Promise<Product[]> {
  if (!(await isSupabaseAvailable())) return MOCK_PRODUCTS;
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("category")
      .order("price", { ascending: true });
    if (error || !data || data.length === 0) return MOCK_PRODUCTS;
    return data as Product[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const fromMock = () => MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  if (!(await isSupabaseAvailable())) return fromMock();
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return fromMock();
    return data as Product;
  } catch {
    return fromMock();
  }
}

export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit = 3,
): Promise<Product[]> {
  const fromMock = () =>
    MOCK_PRODUCTS.filter(
      (p) => p.category === category && p.id !== excludeId,
    ).slice(0, limit);

  if (!(await isSupabaseAvailable())) return fromMock();
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(limit);
    if (error || !data) return fromMock();
    return data as Product[];
  } catch {
    return fromMock();
  }
}

/** Returns `null` when Supabase is unreachable so auth-aware UI degrades to logged-out. */
export async function getCurrentUser() {
  if (!(await isSupabaseAvailable())) return null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
