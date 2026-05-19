import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in user, or null if the request is anonymous.
 * Safe to call from server components and route handlers.
 */
export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Guard that redirects unauthenticated requests to /login (with the
 * intended destination preserved in `?redirect=…`).  Use at the top
 * of any server component that requires auth.
 */
export async function requireUser(redirectTo: string) {
  const user = await getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
