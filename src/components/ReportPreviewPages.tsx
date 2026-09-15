"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Four real pages of the visitor's own report (from /api/report-preview),
 * drawn at full size and scaled to fit, each opening full-screen on tap. The
 * personal readings arrive already blurred and locked.
 */

const PAGE_W = 794;
const PAGE_H = 1123;

const PAGES = [
  { id: "name-align", caption: "Is your name aligned with your birth date?" },
  { id: "money", caption: "How money moves for you" },
  { id: "compat", caption: "Who you match with" },
  { id: "months", caption: "Your next three months" },
] as const;

interface PreviewData {
  head: string;
  pages: { id: string; html: string }[];
}

function srcDoc(head: string, html: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" />${head}<style>html,body{margin:0;background:#0D0D12;overflow:hidden}.page{margin:0 !important}</style></head><body>${html}</body></html>`;
}

/** A report page rendered at its real size and scaled down to its box's width. */
function ScaledPage({ doc, title }: { doc: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / PAGE_W);
    update();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={box} className="scaled-page">
      {scale > 0 && (
        <iframe
          title={title}
          srcDoc={doc}
          width={PAGE_W}
          height={PAGE_H}
          sandbox=""
          tabIndex={-1}
          style={{ transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

/** Full-screen viewer with a fit / zoom-in toggle. Closes with ✕ or Esc. */
export function ZoomDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={ref} className="zoom-dialog" onClose={onClose} aria-label={title}>
      <div className="zoom-dialog-bar">
        <span>{title}</span>
        <div className="zoom-dialog-actions">
          <button type="button" onClick={() => setZoomed((z) => !z)}>
            {zoomed ? "Fit to screen" : "Zoom in"}
          </button>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="zoom-dialog-body">
        <div className={`zoom-dialog-page${zoomed ? " is-zoomed" : ""}`}>{children}</div>
      </div>
    </dialog>
  );
}

export function ReportPreviewPages({
  fullName,
  day,
  month,
  year,
}: {
  fullName: string;
  day: number;
  month: number;
  year: number;
}) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setData(null);
    setFailed(false);
    fetch("/api/report-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, day, month, year }),
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`preview ${res.status}`))))
      .then((json: PreviewData) => setData(json))
      .catch((e: Error) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => ctrl.abort();
  }, [fullName, day, month, year]);

  if (failed) return null;

  const htmlFor = (id: string) => data?.pages.find((p) => p.id === id)?.html ?? "";
  const open = PAGES.find((p) => p.id === openId);

  return (
    <>
      <div className="page-strip" role="group" aria-label="Pages from your report">
        {PAGES.map((p) => (
          <figure className="page-strip-item" key={p.id}>
            {data ? (
              <button type="button" className="page-zoom-btn" onClick={() => setOpenId(p.id)} aria-label={`Zoom in: ${p.caption}`}>
                <ScaledPage doc={srcDoc(data.head, htmlFor(p.id))} title={p.caption} />
                <span className="page-zoom-hint">Tap to zoom</span>
              </button>
            ) : (
              <div className="scaled-page is-loading" aria-hidden="true" />
            )}
            <figcaption>{p.caption}</figcaption>
          </figure>
        ))}
      </div>

      {open && data && (
        <ZoomDialog title={open.caption} onClose={() => setOpenId(null)}>
          <ScaledPage doc={srcDoc(data.head, htmlFor(open.id))} title={open.caption} />
        </ZoomDialog>
      )}
    </>
  );
}
