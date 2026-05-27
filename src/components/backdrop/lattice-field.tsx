"use client";

import { useEffect, useRef } from "react";

/**
 * Crystallographic lattice rendered to a single <canvas>. At rest it reads
 * as quiet hex-grid texture; when the cursor moves, lattice points within
 * an influence radius displace radially outward, like points sitting in
 * a soft potential field.
 *
 * Drawing model:
 *   - Hexagonal close-packed lattice (row offset = spacing / 2).
 *   - Per-frame redraw is gated on real pointer motion. When the pointer
 *     is idle, we draw once and stop animating. Idle CPU is zero.
 *   - DPR is capped at 2 to keep large displays responsive.
 *
 * Layout:
 *   - The canvas fills its parent (use `fixed inset-0` from the caller).
 *   - A CSS `mask-image` fades the lattice toward the viewport edges so it
 *     never feels like wallpaper.
 */
export function LatticeField({
  interactive = true,
  opacity = 0.75,
}: {
  interactive?: boolean;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = -9999;
    let pointerY = -9999;
    let rafId = 0;
    let needsDraw = true;

    const INFLUENCE = 200;
    const MAX_PUSH = 14;

    function getSpacing() {
      return window.innerWidth < 640 ? 34 : 26;
    }

    function getDotRadius() {
      return window.innerWidth < 640 ? 0.9 : 1.1;
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsDraw = true;
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const spacing = getSpacing();
      const rowH = spacing * 0.8660254;
      const r = getDotRadius();
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / rowH) + 2;

      ctx.fillStyle = "oklch(0.16 0.015 250 / 0.16)";

      const hasPointer = interactive && pointerX > -9000;

      for (let row = -1; row < rows; row++) {
        const y0 = row * rowH;
        const xOffset = row % 2 === 0 ? 0 : spacing / 2;
        for (let col = -1; col < cols; col++) {
          const x0 = col * spacing + xOffset;
          let dx = x0;
          let dy = y0;
          if (hasPointer) {
            const vx = x0 - pointerX;
            const vy = y0 - pointerY;
            const dist = Math.hypot(vx, vy);
            if (dist < INFLUENCE && dist > 0.001) {
              const falloff = 1 - dist / INFLUENCE;
              const push = MAX_PUSH * falloff * falloff;
              dx = x0 + (vx / dist) * push;
              dy = y0 + (vy / dist) * push;
            }
          }
          ctx.beginPath();
          ctx.arc(dx, dy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function loop() {
      if (needsDraw) {
        draw();
        needsDraw = false;
      }
      rafId = 0;
    }

    function schedule() {
      needsDraw = true;
      if (rafId) return;
      rafId = requestAnimationFrame(loop);
    }

    function handlePointer(e: PointerEvent) {
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      schedule();
    }

    function handlePointerLeave() {
      pointerX = -9999;
      pointerY = -9999;
      schedule();
    }

    resize();
    schedule();

    const ro = new ResizeObserver(() => {
      resize();
      schedule();
    });
    ro.observe(canvas);

    if (interactive) {
      window.addEventListener("pointermove", handlePointer, { passive: true });
      window.addEventListener("pointerleave", handlePointerLeave);
    }

    return () => {
      ro.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", handlePointer);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        opacity,
        maskImage:
          "radial-gradient(ellipse 70% 55% at 50% 38%, black 35%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 55% at 50% 38%, black 35%, transparent 85%)",
      }}
    />
  );
}
