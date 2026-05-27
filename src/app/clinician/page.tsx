import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteBackdrop } from "@/components/backdrop/site-backdrop";
import { ClinicianCard } from "@/components/clinician-card";
import { PRIMARY_CLINICIAN } from "@/lib/clinician";
import { getUser } from "@/lib/auth";

export const metadata = {
  title: `${PRIMARY_CLINICIAN.name} — Pepwell`,
  description:
    "How Dr. Maya Levin reasons about peptide protocols: the smallest signal that fits the goal, a clear stop criterion, foundations first.",
};

export default async function ClinicianPage() {
  const user = await getUser();
  const c = PRIMARY_CLINICIAN;

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <SiteBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNav user={user} />
        <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-20 pt-14 sm:pt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Clinician
          </p>
          <h1 className="mt-3 text-balance text-[34px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[44px]">
            How I reason about peptide protocols.
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
            Every protocol surfaced in the chat is reviewed against the
            principles below. If a recommendation does not pass them, the
            guide does not make it — even when it would be easier to say yes.
          </p>

          <div className="mt-10">
            <ClinicianCard />
          </div>

          {c.reasoning && (
            <div className="mt-12">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Reasoning
              </h2>
              <div className="mt-4 space-y-5 text-[15px] leading-relaxed text-foreground/85">
                {c.reasoning.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {c.principles && (
            <div className="mt-14">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Principles
              </h2>
              <ol className="mt-5 space-y-5">
                {c.principles.map((p, i) => (
                  <li
                    key={p.title}
                    className="rounded-2xl border border-border bg-background p-5"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-[15.5px] font-medium tracking-tight">
                        {p.title}
                      </h3>
                    </div>
                    <p className="mt-2 pl-7 text-[13.5px] leading-relaxed text-foreground/75">
                      {p.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {c.wont_recommend && (
            <div className="mt-14">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                What I will not recommend
              </h2>
              <ul className="mt-5 space-y-2.5">
                {c.wont_recommend.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-[13.5px] leading-relaxed text-foreground/80"
                  >
                    <span className="mt-[8px] h-px w-3 shrink-0 bg-foreground/40" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.training && (
            <div className="mt-14">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Training
              </h2>
              <dl className="mt-5 divide-y divide-border/60 border-y border-border/60">
                {c.training.map((t) => (
                  <div
                    key={`${t.institution}-${t.detail}`}
                    className="grid grid-cols-[1fr_auto] gap-4 py-3 text-[13.5px]"
                  >
                    <div>
                      <dt className="font-medium text-foreground">
                        {t.institution}
                      </dt>
                      <dd className="text-muted-foreground">{t.detail}</dd>
                    </div>
                    {t.year && (
                      <div className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
                        {t.year}
                      </div>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-14 rounded-2xl border border-border bg-surface/60 p-6">
            <p className="text-[14px] leading-relaxed text-foreground/85">
              Ready to map this to your own goal? The guide will translate
              these principles into a specific, time-bound protocol — or tell
              you that you do not need one.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-medium text-foreground underline-offset-4 hover:underline"
            >
              Talk to the protocol guide
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {c.license}
          </p>

          <p className="mt-6 text-[11.5px] leading-relaxed text-muted-foreground">
            Educational only. Not medical advice. These statements have not
            been evaluated by the FDA. Talk to your own clinician before
            starting any new compound, especially if you are pregnant,
            nursing, under 18, or taking prescription medication.
          </p>
        </section>
        </main>
      </div>
    </div>
  );
}
