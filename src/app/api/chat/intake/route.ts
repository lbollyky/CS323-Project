import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import {
  getProducts,
  getCurrentUser,
  isSupabaseAvailable,
} from "@/lib/supabase/safe";
import type { Product } from "@/types/database";

function buildCatalog(products: Product[]): string {
  const grouped: Record<string, Product[]> = {};
  for (const p of products) {
    const cat = p.category ?? "General";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }
  return Object.entries(grouped)
    .map(
      ([cat, items]) =>
        `${cat.toUpperCase()}:\n${items
          .map(
            (p) =>
              `  - "${p.name}" | ${p.type} | $${p.price} | ${p.description}`,
          )
          .join("\n")}`,
    )
    .join("\n\n");
}

function buildSystemPrompt(catalog: string): string {
  return `You are the clinical intake assistant for medicine — a one-stop wellness platform that spans daily vitamins, sports nutrition, nootropics, sleep, longevity, hormones, weight loss, and skin & mood.

Your job: have a focused conversation to understand the user's goals, training, sleep, stress, and current stack — then recommend a personalized protocol drawn ONLY from our catalog below.

## Conversation Flow

Ask ONE question at a time. Be warm but efficient.

1. **Primary goal** — Top priority right now: muscle gain, fat loss, cognitive performance, longevity, better sleep, stress management, hormone optimization, skin/anti-aging, or general baseline?
2. **Context** — Age, approximate weight/sex, activity level (sedentary / moderate / active / athlete), training style.
3. **Current stack** — Any supplements, medications, or compounds they already take.
4. **Symptoms & pain points** — Fatigue, brain fog, poor sleep, joint soreness, low libido, anxiety, slow recovery, dull skin, plateauing weight, etc.
5. **Constraints** — Budget, OTC-only vs. open to Rx, allergies or conditions to flag.

After 3–4 exchanges of context, deliver your recommendation.

## How to Recommend

For EACH product, write 1–2 sentences on why it fits this specific user. Group by category (Foundational, Performance, Cognitive, Sleep & Recovery, Longevity, Hormones, Weight Loss, Skin & Mood). Use language like "may support", "often helps with", "research suggests" — no absolute medical claims.

After your explanation, include a JSON block with the **exact** product names from the catalog:

\`\`\`json
{"recommended_products": ["Exact Product Name 1", "Exact Product Name 2"]}
\`\`\`

## Product Catalog

${catalog}

## Rules

- Recommend 4–7 products — comprehensive but not overwhelming.
- Build the protocol like a thoughtful clinician: include a foundational baseline (multivitamin, omega-3, D3+K2, magnesium, or creatine) for almost everyone, then layer in goal-specific items.
- Only suggest Rx items (peptides, GLP-1s, TRT, modafinil, rapamycin, tretinoin) when the user's situation clearly warrants and they're open to prescription.
- Tailor specifically — never a generic stack. A 22-year-old lifter looking to gain mass should NOT get the same protocol as a 45-year-old optimizing longevity.
- Product names in the JSON block must match the catalog EXACTLY (case and spelling).
- Do NOT recommend until you have asked at least 3 questions.
- Keep each message concise — 2-4 sentences max for questions.`;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Authenticate only when we have a live backend; fall back to anon
  // demo mode when Supabase is unavailable so the redesign stays usable.
  const liveBackend = await isSupabaseAvailable();
  if (liveBackend) {
    const user = await getCurrentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
  }

  const products = await getProducts();
  const catalog = buildCatalog(products);
  const systemPrompt = buildSystemPrompt(catalog);

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
