import { GuideScreen } from "@/components/guide-screen";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Protocol guide — Pepwell",
  description:
    "Talk to Dr. Levin's AI guide and map your goal to the smallest protocol that fits.",
};

/**
 * The permanent home of the protocol guide. Unlike `/`, this route never
 * redirects, so signed-in users can return to the guide any time.
 */
export default async function GuidePage() {
  const user = await getUser();
  return <GuideScreen user={user} />;
}
