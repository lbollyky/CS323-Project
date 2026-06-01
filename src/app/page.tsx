import { redirect } from "next/navigation";
import { GuideScreen } from "@/components/guide-screen";
import { getUser } from "@/lib/auth";

export default async function Home() {
  const user = await getUser();

  // Signed-in users have already onboarded — send them straight to their
  // tracker on first load. The guide stays reachable at /guide.
  if (user) {
    redirect("/track");
  }

  return <GuideScreen user={user} />;
}
