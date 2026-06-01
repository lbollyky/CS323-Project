import type { User } from "@supabase/supabase-js";
import { ProtocolChat } from "@/components/protocol-chat";
import { SiteNav } from "@/components/site-nav";
import { ChatBackdrop } from "@/components/chat-backdrop";

/**
 * The protocol-guide screen. Shared by the landing page (`/`, shown to
 * anonymous visitors) and the permanent `/guide` route (reachable by
 * signed-in users who want to talk to the guide again).
 */
export function GuideScreen({ user }: { user: User | null }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <ChatBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNav user={user} />
        <main className="flex flex-1 flex-col">
          <ProtocolChat />
        </main>
      </div>
    </div>
  );
}
