"use client";

import { useEffect } from "react";
import { saveUserProtocol } from "@/app/track/actions";
import { productIdsFromLineItems } from "@/components/protocol-header";

export function SaveProtocolFromCheckout({
  lineItemNames,
  goal,
}: {
  lineItemNames: string[];
  goal?: string;
}) {
  useEffect(() => {
    const ids = productIdsFromLineItems(lineItemNames);
    if (ids.length === 0) return;
    void saveUserProtocol({
      protocol_ids: ids,
      goal: goal ?? "Active protocol",
      duration_weeks: 8,
    });
  }, [lineItemNames, goal]);

  return null;
}
