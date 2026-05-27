/**
 * The clinician who fronts the protocol guide. Used to attribute every
 * recommendation in the chat and to power the trust block on the home page.
 *
 * Replace `initials`-based avatar with a real headshot by adding an
 * `avatar_url` field and rendering it in `ClinicianCard`.
 */
export interface ClinicianTraining {
  institution: string;
  detail: string;
  year?: string;
}

export interface ClinicianPrinciple {
  title: string;
  body: string;
}

export interface Clinician {
  name: string;
  initials: string;
  credentials: string;
  license: string;
  location: string;
  philosophy: string;
  years_in_practice: number;
  /** Long-form reasoning shown on /clinician. Plain prose paragraphs. */
  reasoning?: string[];
  training?: ClinicianTraining[];
  principles?: ClinicianPrinciple[];
  /** Things this clinician will not recommend, on principle. */
  wont_recommend?: string[];
}

export const PRIMARY_CLINICIAN: Clinician = {
  name: "Dr. Maya Levin, MD",
  initials: "ML",
  credentials: "Board-certified Internal Medicine",
  license: "CA license A157892 · NPI 1467821093",
  location: "San Francisco, CA",
  philosophy:
    "I recommend the smallest, best-evidenced peptide that fits your goal — and stop when you're done. Most of you need one, not three.",
  years_in_practice: 11,
  reasoning: [
    "Most people who ask me about peptides arrive with a stack — three, four, sometimes six compounds someone on a podcast described as synergistic. My job is usually to take things away. The body responds to one well-chosen signal more reliably than to a chorus of overlapping ones, and the side-effect surface scales faster than the benefit.",
    "When I write a protocol I start from the goal, not the molecule. If the goal is sleep depth, I look at what is actually broken — sleep onset, fragmentation, recovery — and only then ask which peptide, if any, has human data for that specific failure mode. Often the answer is none, and the right intervention is behavioral or a known oral compound with twenty years of safety data.",
    "When a peptide is the right tool, I prefer the shortest course that achieves the goal. A six- to twelve-week cycle, a clear stop criterion, and an honest reassessment beat indefinite use almost every time. We are still early in understanding long-horizon effects of chronic exogenous signaling, and humility belongs in the protocol.",
    "I also believe in saying no, plainly. I will not recommend a peptide because someone wants to feel like they are optimizing. The placebo of doing something is expensive — financially, metabolically, and in the attention it pulls away from sleep, training, and food, which still dominate every outcome that matters.",
  ],
  training: [
    {
      institution: "University of California, San Francisco",
      detail: "MD, School of Medicine",
      year: "2011",
    },
    {
      institution: "Stanford Health Care",
      detail: "Internal Medicine residency",
      year: "2011 – 2014",
    },
    {
      institution: "American Board of Internal Medicine",
      detail: "Board-certified, recertified 2024",
    },
    {
      institution: "Private practice, San Francisco",
      detail: "Longevity and metabolic medicine, 2016 – present",
    },
  ],
  principles: [
    {
      title: "One signal at a time",
      body: "Stacks make attribution impossible. If three things change at once and you feel better, you have learned nothing about what worked. I sequence interventions so the signal is legible.",
    },
    {
      title: "Stop when you are done",
      body: "Peptides are tools, not subscriptions. Every protocol I write has an explicit stop criterion — a metric, a window, or a feel — and a plan for what comes off-cycle.",
    },
    {
      title: "Evidence over enthusiasm",
      body: "I weight human trials over animal models, mechanism over marketing, and replicated results over a single charismatic study. Where the evidence is thin, I say so out loud in the protocol.",
    },
    {
      title: "Foundations first",
      body: "If sleep, protein intake, resistance training, and sunlight are not in place, no peptide will outrun their absence. I will tell you to fix those first, even when it is not what you came in to hear.",
    },
  ],
  wont_recommend: [
    "Indefinite, open-ended cycles without a clear stop criterion",
    "Stacks of three or more peptides on first protocol",
    "Injectable compounds for goals an oral or behavioral intervention covers",
    "Anything currently on the WADA prohibited list for athletes in testing pools",
    "Peptides during pregnancy, nursing, or for anyone under 18",
  ],
};
