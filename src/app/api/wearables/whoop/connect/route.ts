import { NextResponse } from "next/server";
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

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const origin = baseUrl(request);
  const redirectUri = `${origin}/api/wearables/whoop/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/track?wearable=whoop&mode=demo", request.url),
    );
  }

  const url = new URL("https://api.prod.whoop.com/oauth/oauth2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "read:recovery read:sleep offline");
  url.searchParams.set("state", user.id);

  return NextResponse.redirect(url.toString());
}
