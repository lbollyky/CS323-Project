import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are a metabolic data scientist working for medicine.com. Analyze the user's recent daily logs and provide a short, actionable insight.

Rules:
- Look at correlations between products taken, energy levels, weight trends, and reported side effects.
- Your response must be exactly 2-3 sentences. No bullet points, no headers.
- Be specific and reference the data (e.g., "Over the past 5 days…").
- If the data is limited, acknowledge that and give a general recommendation.
- Use professional but accessible language. Avoid medical jargon.
- Never diagnose conditions or make prescriptive medical claims.`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(7);

  if (!logs || logs.length === 0) {
    return Response.json({
      insight:
        "No daily logs recorded yet. Start logging your metrics each day — even a few entries will allow us to generate personalized insights about your protocol's effectiveness.",
    });
  }

  const logsContext = logs
    .map(
      (log) =>
        `Date: ${log.date} | Energy: ${log.energy_level}/10 | Weight: ${log.weight ?? "N/A"} | Products: ${(log.products_taken ?? []).join(", ") || "none"} | Side effects: ${log.side_effects || "none"} | Notes: ${log.notes || "none"}`,
    )
    .join("\n");

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    prompt: `Here are the user's last ${logs.length} daily log entries:\n\n${logsContext}\n\nProvide your 2-3 sentence insight.`,
  });

  return Response.json({ insight: text });
}
