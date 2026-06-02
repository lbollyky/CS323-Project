"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, X } from "lucide-react";
import { PRIMARY_CLINICIAN } from "@/lib/clinician";

const PROVIDER_EMAIL = "providers@pepwell.com";

export function ContactProviderButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const mailto = `mailto:${PROVIDER_EMAIL}?subject=${encodeURIComponent(
    "Question about my protocol",
  )}`;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-foreground/40"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Questions? Talk to a provider
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Contact a healthcare provider"
          className="animate-modal-panel absolute right-0 z-30 mt-2 w-[300px] rounded-2xl border border-border bg-background p-5 shadow-xl"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="focus-ring absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Clinical support
          </p>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight">
            Have a question?
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Reach {PRIMARY_CLINICIAN.name.split(",")[0]} and the clinical team
            about dosing, side effects, or anything in your protocol. Most
            questions are answered within one business day.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <a
              href={mailto}
              className="focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            >
              <Mail className="h-3.5 w-3.5" />
              Email the clinical team
            </a>
            <Link
              href="/clinician"
              className="focus-ring inline-flex h-9 items-center justify-center rounded-xl border border-border text-[13px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              Meet your clinician
            </Link>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">
            For medical emergencies, call 911. This is not a substitute for
            urgent care.
          </p>
        </div>
      )}
    </div>
  );
}
