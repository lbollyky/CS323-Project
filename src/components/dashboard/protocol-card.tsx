import Link from "next/link";
import { FlaskConical, Shield, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/database";

interface ProtocolCardProps {
  products: Product[];
}

export function ProtocolCard({ products }: ProtocolCardProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">My Protocol</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active protocol yet. Complete the AI intake to receive your
            personalized supplement stack.
          </p>
          <Link href="/intake">
            <Button variant="outline" size="sm" className="mt-3">
              Start Intake
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const otc = products.filter((p) => p.type === "OTC");
  const rx = products.filter((p) => p.type === "Rx");
  const total = products.reduce((s, p) => s + p.price, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">My Protocol</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {products.length} item{products.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {otc.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-sm">{p.name}</span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              ${p.price.toFixed(2)}
            </span>
          </div>
        ))}
        {rx.map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-amber-500" />
              <span className="text-sm">{p.name}</span>
            </div>
            <span className="text-xs text-amber-600 font-medium tabular-nums">
              ${p.price.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">Monthly</span>
          <span className="text-sm font-semibold tabular-nums">
            ${total.toFixed(2)}
          </span>
        </div>
        <Link href="/intake">
          <Button variant="ghost" size="sm" className="w-full mt-1 text-xs">
            Update Protocol
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
