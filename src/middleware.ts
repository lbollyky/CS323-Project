import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* ─── Lightweight, per-process Supabase health probe ───────── */
type Health = "unknown" | "ok" | "down";
let health: Health = "unknown";
let lastCheck = 0;
const TTL_MS = 60_000;
const PROBE_TIMEOUT_MS = 1500;

async function probe(url: string, key: string): Promise<boolean> {
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
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

async function supabaseReachable(url: string, key: string): Promise<boolean> {
  const now = Date.now();
  if (health !== "unknown" && now - lastCheck < TTL_MS) {
    return health === "ok";
  }
  const ok = await probe(url, key);
  health = ok ? "ok" : "down";
  lastCheck = now;
  if (!ok) {
    console.warn(
      "[medicine] Supabase unreachable in middleware — auth checks disabled, app will render with mock data.",
    );
  }
  return ok;
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No env? Skip everything — pages will degrade to mock data.
  if (!url || !key || url.includes("your_supabase")) {
    return NextResponse.next({ request });
  }

  // Project unreachable? Don't waste 25 s retrying token refresh per request.
  if (!(await supabaseReachable(url, key))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Token refresh hiccup — let request through rather than blocking
    return supabaseResponse;
  }

  const protectedPaths = ["/dashboard", "/checkout", "/intake"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
