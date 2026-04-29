"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InsightsCard() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      try {
        const res = await fetch("/api/insights", { method: "POST" });
        const data = await res.json();
        setInsight(data.insight);
      } catch {
        setInsight(
          "Unable to generate insights right now. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchInsight();
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-base">Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing your recent data…
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">{insight}</p>
        )}
      </CardContent>
    </Card>
  );
}
