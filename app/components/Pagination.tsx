import React from "react";
import Link from "next/link";

export default function Pagination({
  total,
  page,
  perPage,
  basePath,
  searchParams,
}: {
  total: number;
  page: number;
  perPage: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, perPage)));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  function hrefFor(p: number) {
    const sp = new URLSearchParams();
    if (searchParams) {
      for (const [k, v] of Object.entries(searchParams)) {
        if (v === undefined) continue;
        if (Array.isArray(v)) {
          for (const x of v) sp.append(k, String(x));
        } else {
          sp.set(k, String(v));
        }
      }
    }
    sp.set("page", String(p));
    sp.set("perPage", String(perPage));
    return `${basePath}?${sp.toString()}`;
  }

  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="row" style={{justifyContent:'space-between', alignItems:'center', gap:12}}>
      <div className="small">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </div>
      <div className="row" style={{gap:8}}>
        <Link href={canPrev ? hrefFor(page - 1) : "#"} aria-disabled={!canPrev}>
          <button disabled={!canPrev}>&larr; Prev</button>
        </Link>
        <div className="small">Page {page} of {pageCount}</div>
        <Link href={canNext ? hrefFor(page + 1) : "#"} aria-disabled={!canNext}>
          <button disabled={!canNext}>Next &rarr;</button>
        </Link>
      </div>
    </div>
  );
}
