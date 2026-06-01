import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

function baseUrl(request: Request): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?redirect=/track", request.url));
  }

  const clientId = process.env.OURA_CLIENT_ID;
  const clientSecret = process.env.OURA_CLIENT_SECRET;
  const origin = baseUrl(request);
  const redirectUri = `${origin}/api/wearables/oura/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/track?wearable=oura&mode=demo", request.url),
    );
  }

  const url = new URL("https://cloud.ouraring.com/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "daily personal email");
  url.searchParams.set("state", user.id);

  return NextResponse.redirect(url.toString());
}
