import { Suspense } from "react";
import { Beaker, FileText, ShieldCheck, Truck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteBackdrop } from "@/components/backdrop/site-backdrop";
import { BatchSearch } from "@/components/verify/batch-search";
import { BatchCard } from "@/components/verify/batch-card";
import { getBatchesSortedByDate } from "@/lib/batches";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: "Verify a batch — Pepwell",
  description:
    "Type the lot number printed on your vial to pull the exact HPLC and Mass Spec reports for that batch. Every lot we have ever shipped is on the public record here.",
};

export const dynamic = "force-dynamic";

interface VerifyPageProps {
  searchParams: Promise<{ lot?: string }>;
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const [user, sp] = await Promise.all([getUser(), searchParams]);
  const initialLot = sp.lot?.trim() ?? "";
  const recent = getBatchesSortedByDate().slice(0, 6);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <SiteBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNav user={user} />
        <main className="flex-1">
          <section className="mx-auto max-w-4xl px-5 pb-10 pt-14 sm:pt-20">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Batch verification
            </div>
            <h1 className="mt-3 text-balance text-[34px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[44px]">
              Every batch, on the record.
            </h1>
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
              Type the lot number printed on your vial to pull the exact HPLC
              chromatogram and Mass Spec report for that specific batch. We
              publish lots that passed and lots we quarantined. There is no
              curated highlight reel.
            </p>

            <div className="mt-10">
              <Suspense fallback={<SearchFallback />}>
                <BatchSearch initialLot={initialLot} />
              </Suspense>
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-5 pb-12">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Recent batches on file
              </h2>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                {recent.length} most recent · {totalReleased()} released to date
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {recent.map((b) => (
                <BatchCard key={b.lot} batch={b} />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-5 pb-20">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              How testing works
            </h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              <Step
                icon={Truck}
                index="01"
                title="Sample pulled from the run"
                body="Every manufacturing run is sampled before any vial is sealed. Samples ship the same day to a third-party lab — never our own."
              />
              <Step
                icon={Beaker}
                index="02"
                title="HPLC + Mass Spec, on every lot"
                body="HPLC measures purity against a 98% spec floor. Mass Spec confirms the exact peptide sequence at the molecular level."
              />
              <Step
                icon={FileText}
                index="03"
                title="Reports posted before shipment"
                body="No vial leaves our facility until the reports are uploaded here and tied to the lot you'll receive. Failed lots are publicly logged and destroyed."
              />
            </ol>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Where is my lot number?
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  Look at the side panel of your vial. The lot is the line
                  starting with three letters and a year — for example,{" "}
                  <span className="font-mono text-foreground">
                    EPI-2026-031
                  </span>
                  . It is also printed on the bottom of the outer carton and
                  inside your shipping confirmation email.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Cannot find your batch?
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  Email{" "}
                  <a
                    href="mailto:trust@pepwell.app"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    trust@pepwell.app
                  </a>{" "}
                  with a photo of your label. We will trace the lot, send the
                  reports directly, and add the entry here within one business
                  day.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="h-14 w-full animate-pulse rounded-2xl border border-border bg-background/60" />
  );
}

function Step({
  icon: Icon,
  index,
  title,
  body,
}: {
  icon: typeof Beaker;
  index: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          {index}
        </span>
      </div>
      <h3 className="mt-3 text-[15px] font-medium tracking-tight">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </li>
  );
}

/** Count of `released` batches across the public ledger — small but real
 *  social-proof number. Recomputed at request time alongside the page. */
function totalReleased(): number {
  return getBatchesSortedByDate().filter((b) => b.status === "released")
    .length;
}
