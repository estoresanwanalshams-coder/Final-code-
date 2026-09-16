"use client";

import { useState } from "react";

type ProductSummaryProps = {
  summary: string;
};

export function ProductSummary({
  summary,
}: ProductSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4">
      <p
        className={`whitespace-pre-line text-[13px] leading-6 text-zinc-600 sm:text-sm sm:leading-7 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {summary}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="mt-2 text-xs font-semibold text-hm-orange hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}