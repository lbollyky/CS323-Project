"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ClipboardList } from "lucide-react";
import type { Product } from "@/types/database";
import { cn } from "@/lib/utils";

interface DailyLogFormProps {
  userId: string;
  products: Product[];
}

export function DailyLogForm({ userId, products }: DailyLogFormProps) {
  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState(5);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sideEffects, setSideEffects] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingLog, setExistingLog] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadToday() {
      const supabase = createClient();
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (data) {
        setExistingLog(true);
        setWeight(data.weight?.toString() ?? "");
        setEnergy(data.energy_level);
        setSelectedProducts(data.products_taken ?? []);
        setSideEffects(data.side_effects ?? "");
        setNotes(data.notes ?? "");
      }
    }
    loadToday();
  }, [userId, today]);

  function toggleProduct(name: string) {
    setSelectedProducts((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const payload = {
      user_id: userId,
      date: today,
      weight: weight ? parseFloat(weight) : null,
      energy_level: energy,
      products_taken: selectedProducts,
      side_effects: sideEffects || null,
      notes: notes || null,
    };

    if (existingLog) {
      await supabase
        .from("daily_logs")
        .update(payload)
        .eq("user_id", userId)
        .eq("date", today);
    } else {
      await supabase.from("daily_logs").insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setExistingLog(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Daily Log</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Products taken */}
          <div>
            <label className="text-sm font-medium">Products taken today</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.name)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selectedProducts.includes(p.name)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {selectedProducts.includes(p.name) && (
                    <Check className="mr-1 inline h-3 w-3" />
                  )}
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Weight & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="text-sm font-medium">
                Weight (lbs)
              </label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 175"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Energy level
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
                <span className="w-6 text-center text-sm font-semibold tabular-nums">
                  {energy}
                </span>
              </div>
            </div>
          </div>

          {/* Side effects */}
          <div>
            <label htmlFor="side-effects" className="text-sm font-medium">
              Side effects
            </label>
            <Input
              id="side-effects"
              placeholder="e.g. mild headache, none"
              value={sideEffects}
              onChange={(e) => setSideEffects(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              placeholder="How are you feeling overall? Any changes noticed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saved ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Saved
              </>
            ) : saving ? (
              "Saving…"
            ) : existingLog ? (
              "Update Log"
            ) : (
              "Save Log"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
