/**
 * Authored content for the scientific backdrop.
 *
 * The point of these constants is that they were *picked* — real peptides,
 * real molecular weights, real half-lives, real sequences. The design of
 * the backdrop is the curation, not the rendering.
 */

/**
 * One-line facts shown in the bottom chyron. The format is intentionally
 * uniform — `<name> · <sequence> · <constant> · <constant>` — because
 * uniformity is the human-authored tell that AI gradient pages never have.
 */
export const CHYRON_FACTS: readonly string[] = [
  "BPC-157 · GEPPPGKPADDAGLV · MW 1419.5 Da · t½ ≈ 4 h",
  "GHK-Cu · Gly-His-Lys · copper-binding tripeptide · MW 340.4 Da",
  "Thymosin β-4 · 43 aa · actin-sequestering · t½ ≈ 1.4 h",
  "Semax · Met-Glu-His-Phe-Pro-Gly-Pro · MW 813.9 Da · ACTH(4-10) analog",
  "Selank · Thr-Lys-Pro-Arg-Pro-Gly-Pro · MW 751.9 Da · anxiolytic peptide",
  "DSIP · Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu · 9 aa · sleep-correlated",
  "Epitalon · Ala-Glu-Asp-Gly · MW 390.3 Da · telomerase-modulating",
  "PE-22-28 · 7 aa spadin analog · TREK-1 channel inhibition",
  "MOTS-c · 16 aa mitochondrial-derived · metabolic homeostasis",
  "Humanin · 24 aa · binds BAX · mitochondrial cytoprotection",
];
