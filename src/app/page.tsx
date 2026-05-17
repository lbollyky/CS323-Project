import { ProtocolChat } from "@/components/protocol-chat";
import { SiteNav } from "@/components/site-nav";
import { ChatBackdrop } from "@/components/chat-backdrop";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <ChatBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNav />
        <main className="flex flex-1 flex-col">
          <ProtocolChat />
        </main>
      </div>
    </div>
  );
}
