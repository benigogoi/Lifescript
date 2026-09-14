"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./poster.module.css";

const SAMPLE_SRC = "/samples/sample-loshu.webp";

/**
 * The sample report page, tap to view full-screen. The sample is the page's
 * proof the product is real, but at thumbnail size its text is unreadable.
 *
 * Native <dialog> (Esc, focus trap and back-to-page for free). The full-size
 * image only mounts once opened, so it costs nothing for people who never tap.
 * Tapping the image zooms to 2.2× centred on the tap point; tap again to fit.
 */
export function SampleZoom({ alt, hint }: { alt: string; hint: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const focus = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // After zooming in, scroll so the spot they tapped is in the middle.
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const img = scroller?.querySelector("img");
    if (!zoomed || !scroller || !img || !focus.current) return;
    scroller.scrollLeft = focus.current.x * img.offsetWidth - scroller.clientWidth / 2;
    scroller.scrollTop = focus.current.y * img.offsetHeight - scroller.clientHeight / 2;
    focus.current = null;
  }, [zoomed]);

  function show() {
    setZoomed(false);
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function toggleZoom(e: React.MouseEvent<HTMLImageElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    focus.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    setZoomed((z) => !z);
  }

  return (
    <>
      <button type="button" className={styles.sampleButton} onClick={show} aria-label="Zoom in on the sample report page">
        <Image
          src={SAMPLE_SRC}
          alt={alt}
          width={1191}
          height={1685}
          sizes="(max-width: 520px) 80vw, 400px"
          loading="lazy"
        />
      </button>
      <div className={styles.sampleHint}>{hint}</div>

      <dialog ref={dialogRef} className={styles.zoom} onClose={() => setOpen(false)} aria-label={alt}>
        <button type="button" className={styles.zoomClose} onClick={close} aria-label="Close">
          ✕
        </button>
        <div
          ref={scrollRef}
          className={zoomed ? styles.zoomScrollBig : styles.zoomScroll}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {open && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={SAMPLE_SRC}
              alt={alt}
              width={1191}
              height={1685}
              className={zoomed ? styles.zoomImgBig : styles.zoomImg}
              onClick={toggleZoom}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
