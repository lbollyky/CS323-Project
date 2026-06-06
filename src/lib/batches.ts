/**
 * Single source of truth for the public batch-verification portal at
 * `/verify`. Each entry corresponds to a manufacturing lot that shipped
 * to customers and is publicly traceable to its third-party lab work.
 *
 * Adding a new batch:
 *   1. Append an entry below with a unique `lot` (format: `<PROD>-<YYYY>-<NNN>`).
 *   2. Drop the actual HPLC and Mass Spec PDFs into `public/lab-reports/`.
 *   3. Set `hplc_report_url` / `ms_report_url` to those static paths
 *      (e.g. `/lab-reports/EPI-2026-031-hplc.pdf`). Leave them as the
 *      internal `/lab-reports/<lot>/<type>` viewer paths to keep the
 *      built-in HTML preview while waiting for the real PDFs.
 *
 * Status conventions:
 *   - `released` — passed all tests and shipped to customers.
 *   - `pending`  — sample at the lab, results not yet published.
 *   - `quarantined` — failed a spec; not shipped. We surface these on
 *     purpose so the public ledger isn't a curated highlight reel.
 */

import { getProduct } from "@/lib/products";

export type BatchStatus = "released" | "pending" | "quarantined";

export interface Batch {
  lot: string;
  product_id: string;
  manufactured_on: string; // ISO date (YYYY-MM-DD)
  tested_on: string | null;
  lab_name: string;
  /** HPLC purity, 0–100. `null` when results are not yet in. */
  hplc_purity_pct: number | null;
  /** Mass-spec target-mass match, 0–100. */
  ms_match_pct: number | null;
  /** Spec floor for HPLC purity — used to show pass/fail clearly. */
  spec_min_pct: number;
  status: BatchStatus;
  hplc_report_url: string | null;
  ms_report_url: string | null;
  /** Optional one-liner about why a batch was quarantined. */
  note?: string;
}

function reportUrl(lot: string, type: "hplc" | "ms"): string {
  return `/lab-reports/${lot}/${type}`;
}

export const BATCHES: Batch[] = [
  {
    lot: "EPI-2026-031",
    product_id: "epitalon",
    manufactured_on: "2026-05-04",
    tested_on: "2026-05-09",
    lab_name: "Eurofins CRL Bioanalytical",
    hplc_purity_pct: 99.2,
    ms_match_pct: 99.7,
    spec_min_pct: 98.0,
    status: "released",
    hplc_report_url: reportUrl("EPI-2026-031", "hplc"),
    ms_report_url: reportUrl("EPI-2026-031", "ms"),
  },
  {
    lot: "PIN-2026-022",
    product_id: "pinealon",
    manufactured_on: "2026-04-21",
    tested_on: "2026-04-26",
    lab_name: "Eurofins CRL Bioanalytical",
    hplc_purity_pct: 98.8,
    ms_match_pct: 99.5,
    spec_min_pct: 98.0,
    status: "released",
    hplc_report_url: reportUrl("PIN-2026-022", "hplc"),
    ms_report_url: reportUrl("PIN-2026-022", "ms"),
  },
  {
    lot: "EPI-2026-029",
    product_id: "epitalon",
    manufactured_on: "2026-03-12",
    tested_on: "2026-03-17",
    lab_name: "Alkemist Labs",
    hplc_purity_pct: 99.4,
    ms_match_pct: 99.8,
    spec_min_pct: 98.0,
    status: "released",
    hplc_report_url: reportUrl("EPI-2026-029", "hplc"),
    ms_report_url: reportUrl("EPI-2026-029", "ms"),
  },
  {
    lot: "BPC-2026-014",
    product_id: "restore-bpc",
    manufactured_on: "2026-02-28",
    tested_on: "2026-03-04",
    lab_name: "Janoshik Analytical",
    hplc_purity_pct: 99.0,
    ms_match_pct: 99.6,
    spec_min_pct: 98.0,
    status: "released",
    hplc_report_url: reportUrl("BPC-2026-014", "hplc"),
    ms_report_url: reportUrl("BPC-2026-014", "ms"),
  },
  {
    lot: "PIN-2026-019",
    product_id: "pinealon",
    manufactured_on: "2026-02-09",
    tested_on: "2026-02-14",
    lab_name: "Eurofins CRL Bioanalytical",
    hplc_purity_pct: 97.4,
    ms_match_pct: 99.2,
    spec_min_pct: 98.0,
    status: "quarantined",
    hplc_report_url: reportUrl("PIN-2026-019", "hplc"),
    ms_report_url: reportUrl("PIN-2026-019", "ms"),
    note: "Held — HPLC purity below 98.0% spec. Lot destroyed; no units shipped.",
  },
  {
    lot: "EPI-2026-026",
    product_id: "epitalon",
    manufactured_on: "2026-01-18",
    tested_on: "2026-01-23",
    lab_name: "Alkemist Labs",
    hplc_purity_pct: 99.1,
    ms_match_pct: 99.6,
    spec_min_pct: 98.0,
    status: "released",
    hplc_report_url: reportUrl("EPI-2026-026", "hplc"),
    ms_report_url: reportUrl("EPI-2026-026", "ms"),
  },
  {
    lot: "BPC-2026-012",
    product_id: "restore-bpc",
    manufactured_on: "2026-06-02",
    tested_on: null,
    lab_name: "Janoshik Analytical",
    hplc_purity_pct: null,
    ms_match_pct: null,
    spec_min_pct: 98.0,
    status: "pending",
    hplc_report_url: null,
    ms_report_url: null,
  },
];

/** Most recent first, regardless of status. */
export function getBatchesSortedByDate(): Batch[] {
  return [...BATCHES].sort((a, b) =>
    a.manufactured_on < b.manufactured_on ? 1 : -1,
  );
}

/** Case-insensitive exact match — what a customer types from the vial. */
export function findBatchByLot(lot: string): Batch | null {
  const target = lot.trim().toUpperCase();
  return BATCHES.find((b) => b.lot.toUpperCase() === target) ?? null;
}

/** Prefix / partial match for live search. Returns up to `limit` results. */
export function searchBatches(query: string, limit = 8): Batch[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  return BATCHES.filter((b) => b.lot.toUpperCase().includes(q)).slice(0, limit);
}

export interface BatchProductInfo {
  name: string;
  short_name: string;
  category: string;
}

/** Resolve batch.product_id back to a friendly product header. Falls
 *  back to the raw id so the UI never crashes on an unknown product. */
export function getBatchProductInfo(productId: string): BatchProductInfo {
  const product = getProduct(productId);
  if (!product) {
    return { name: productId, short_name: productId, category: "Compound" };
  }
  return {
    name: product.name,
    short_name: product.short_name,
    category: product.category,
  };
}
