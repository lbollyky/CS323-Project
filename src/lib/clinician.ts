/**
 * The clinician who fronts the protocol guide. Used to attribute every
 * recommendation in the chat and to power the trust block on the home page.
 *
 * Replace `initials`-based avatar with a real headshot by adding an
 * `avatar_url` field and rendering it in `ClinicianCard`.
 */
export interface Clinician {
  name: string;
  initials: string;
  credentials: string;
  license: string;
  location: string;
  philosophy: string;
  years_in_practice: number;
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
};
