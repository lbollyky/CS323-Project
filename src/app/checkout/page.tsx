"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Clock, Loader2, Pill, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

type CheckoutStep = "review" | "processing" | "complete";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [rxApproved, setRxApproved] = useState(false);

  const otcItems = items.filter((i) => i.product.type === "OTC");
  const rxItems = items.filter((i) => i.product.type === "Rx");
  const hasRx = rxItems.length > 0;

  useEffect(() => {
    if (step === "processing" && hasRx && !rxApproved) {
      const timer = setTimeout(() => setRxApproved(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [step, hasRx, rxApproved]);

  function handlePlaceOrder() {
    setStep("processing");
    if (!hasRx) {
      setTimeout(() => setStep("complete"), 1500);
    }
  }

  function handleConfirm() {
    setStep("complete");
  }

  function handleGoToDashboard() {
    clearCart();
    router.push("/dashboard");
  }

  if (items.length === 0 && step === "review") {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              medicine<span className="text-primary">.com</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="w-full max-w-sm text-center">
            <CardHeader>
              <CardTitle>No items in your cart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete the clinical intake to receive your personalized
                protocol.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/intake">
                <Button>
                  Start Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
            >
              medicine<span className="text-primary">.com</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-semibold">Order confirmed</h1>
            <p className="mt-2 text-muted-foreground">
              Your protocol is active. Head to your dashboard to begin daily
              tracking and receive personalized insights.
            </p>
            <Button onClick={handleGoToDashboard} size="lg" className="mt-8">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            medicine<span className="text-primary">.com</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <h1 className="text-2xl font-semibold">Review your protocol</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm the items below to activate your personalized stack.
          </p>

          {/* OTC */}
          {otcItems.length > 0 && (
            <Card className="mt-8">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    OTC Supplements
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {otcItems.map(({ product }) => (
                    <li
                      key={product.id}
                      className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Rx */}
          {rxItems.length > 0 && (
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Prescription Items
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {rxItems.map(({ product }) => (
                    <li
                      key={product.id}
                      className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums whitespace-nowrap">
                          ${product.price.toFixed(2)}
                        </p>
                        {step === "processing" && (
                          <p
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-xs font-medium",
                              rxApproved
                                ? "text-emerald-600"
                                : "text-amber-600",
                            )}
                          >
                            {rxApproved ? (
                              <>
                                <Check className="h-3 w-3" /> Approved
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 animate-pulse" />{" "}
                                Pending approval
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {step === "review" && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-amber-800">
                      Prescription items require physician review before
                      dispensing. Approval is typically completed within moments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Total */}
          <div className="mt-6 flex items-center justify-between rounded-xl border bg-card px-5 py-4">
            <p className="text-sm font-medium text-muted-foreground">
              Monthly total
            </p>
            <p className="text-xl font-semibold tabular-nums">
              ${total().toFixed(2)}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6">
            {step === "review" && (
              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                size="lg"
              >
                Place Order
              </Button>
            )}
            {step === "processing" && (
              <>
                {hasRx && !rxApproved ? (
                  <Button disabled className="w-full" size="lg">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Awaiting physician approval…
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfirm}
                    className="w-full"
                    size="lg"
                  >
                    Confirm Order
                  </Button>
                )}
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground/60">
            This is a prototype demo. No payment will be processed.
          </p>
        </div>
      </main>
    </div>
  );
}
