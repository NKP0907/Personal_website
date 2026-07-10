"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────
const NO_TEXTS = [
  "No 💔", "No 🙈", "Think Again 😅", "Really? 🥺",
  "Are You Sure? 💔", "Catch Me 😂", "Impossible 😜",
  "Try Again ❤️", "No way! 🫣", "Don't do this! 😭",
];

const YES_GROWTH      = 0.09;   // scale added per dodge
const YES_MAX_SCALE   = 3.4;    // max growth cap
const YES_BASE_W      = 130;    // approximate YES button width in px at scale 1
const YES_BASE_H      = 48;     // approximate YES button height in px at scale 1
const NO_W            = 115;    // approximate NO button width
const NO_H            = 42;     // approximate NO button height
const CONTAINER_H     = 150;    // container height in px
const PROXIMITY_START = 150;    // cursor detection radius in px

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProposalButtonsProps { onYes: () => void; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProposalButtons({ onYes }: ProposalButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noDivRef     = useRef<HTMLDivElement>(null);

  const [noText, setNoText]         = useState("No 💔");
  const [dodgeCount, setDodgeCount] = useState(0);

  // YES spring scale
  const yesScaleTarget = Math.min(1 + dodgeCount * YES_GROWTH, YES_MAX_SCALE);

  // YES magnetic pull on desktop
  const yesMagX = useSpring(0, { stiffness: 160, damping: 18, mass: 0.12 });
  const yesMagY = useSpring(0, { stiffness: 160, damping: 18, mass: 0.12 });

  // NO position (starts offset to the right so it's side-by-side with YES initially)
  const noX = useMotionValue(90);
  const noY = useMotionValue(0);

  // Spring stiffness increases each dodge → gets snappier / harder to catch
  const springStiffness = Math.min(300 + dodgeCount * 22, 700);
  const noXSpring = useSpring(noX, { stiffness: springStiffness, damping: 24, mass: 0.45 });
  const noYSpring = useSpring(noY, { stiffness: springStiffness, damping: 24, mass: 0.45 });
  const noRotate  = useSpring(0,   { stiffness: 260, damping: 20 });

  // Track last dodge timestamp + current clamped position
  const lastDodge  = useRef(0);
  const currentPos = useRef({ x: 90, y: 0 });

  // ── Dodge logic ─────────────────────────────────────────────────────────────
  const dodge = useCallback(
    (pointerX: number, pointerY: number) => {
      const now = Date.now();
      // Throttle: max 1 dodge per (110ms → shrinks to 60ms by dodge 10)
      const throttle = Math.max(60, 110 - dodgeCount * 5);
      if (now - lastDodge.current < throttle) return;
      lastDodge.current = now;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const cW   = rect.width;
      const cH   = CONTAINER_H;

      // How much YES occupies at current scale
      const yesW = YES_BASE_W * yesScaleTarget;
      const yesH = YES_BASE_H * yesScaleTarget;

      // Safe half-extents for NO button center (keep fully inside container)
      const safeHalfX = Math.max(NO_W / 2, cW  / 2 - NO_W  / 2 - 4);
      const safeHalfY = Math.max(NO_H / 2, cH  / 2 - NO_H  / 2 - 4);

      // Container center in page coords
      const cCX = rect.left + cW / 2;
      const cCY = rect.top  + cH / 2;

      // Pointer relative to container center
      const mxL = pointerX - cCX;
      const myL = pointerY - cCY;

      // Current NO position relative to container center
      const cx = currentPos.current.x;
      const cy = currentPos.current.y;

      // Flee vector = direction away from cursor
      const fx = cx - mxL;
      const fy = cy - myL;
      const fm = Math.sqrt(fx * fx + fy * fy) || 1;

      // Flee distance: base 160px + jitter, grows slightly with dodgeCount
      const baseFlee = 160 + dodgeCount * 6;
      const fleeDist = baseFlee + Math.random() * 60;

      let tx = cx + (fx / fm) * fleeDist + (Math.random() - 0.5) * 80;
      let ty = cy + (fy / fm) * fleeDist + (Math.random() - 0.5) * 80;

      // Clamp inside container
      tx = Math.max(-safeHalfX, Math.min(safeHalfX, tx));
      ty = Math.max(-safeHalfY, Math.min(safeHalfY, ty));

      // Push position — raw set gives instant spring target update
      noX.set(tx);
      noY.set(ty);
      noRotate.set((Math.random() - 0.5) * 30);
      currentPos.current = { x: tx, y: ty };

      // Cycle text
      setNoText((prev) => {
        const cur  = NO_TEXTS.indexOf(prev);
        let   next = Math.floor(Math.random() * NO_TEXTS.length);
        if (next === cur) next = (next + 1) % NO_TEXTS.length;
        return NO_TEXTS[next];
      });

      setDodgeCount((c) => Math.min(c + 1, Math.floor((YES_MAX_SCALE - 1) / YES_GROWTH)));
    },
    [dodgeCount, yesScaleTarget, noX, noY, noRotate]
  );

  // ── Proximity detection (mouse) ──────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const btn = noDivRef.current;
      if (!btn) return;
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.sqrt(dx * dx + dy * dy) < PROXIMITY_START) {
        dodge(e.clientX, e.clientY);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [dodge]);

  // ── YES magnetic handlers ────────────────────────────────────────────────────
  const onYesMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    yesMagX.set((e.clientX - (r.left + r.width  / 2)) * 0.22);
    yesMagY.set((e.clientY - (r.top  + r.height / 2)) * 0.22);
  };
  const onYesLeave = () => { yesMagX.set(0); yesMagY.set(0); };

  // ── Visual calculations ──────────────────────────────────────────────────────
  // YES glow intensifies with dodgeCount
  const glowSize    = Math.min(8  + dodgeCount * 5,  60);
  const glowSpread  = Math.min(4  + dodgeCount * 3,  30);
  const glowOpacity = Math.min(0.25 + dodgeCount * 0.05, 0.95);

  // NO fades out progressively behind YES
  // Starts fading after dodge 5, nearly invisible by dodge 13
  const noOpacity  = Math.max(0.05, 1 - Math.max(0, dodgeCount - 5) * 0.11);
  const noScale    = Math.max(0.55, 1 - Math.max(0, dodgeCount - 6) * 0.07);
  // NO sits below YES (z-index 20 vs YES z-index 30)

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full overflow-visible"
      style={{ height: CONTAINER_H }}
    >
      {/* ─── YES button — always perfectly centered, grows toward viewer ─── */}
      <motion.div
        className="absolute flex items-center justify-center"
        style={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          zIndex: 30,
        }}
      >
        {/* YES button wrapper — magnetic on desktop, grows via scale */}
        <motion.div
          style={{ x: yesMagX, y: yesMagY }}
          animate={{ scale: yesScaleTarget }}
          transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
        >
          <motion.button
            onClick={onYes}
            onMouseMove={onYesMove}
            onMouseLeave={onYesLeave}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            animate={{
              boxShadow: `0 0 ${glowSize * 2}px ${glowSpread}px rgba(244,63,94,${glowOpacity})`,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.9 }}
            className="relative px-7 py-3 sm:px-8 sm:py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white font-bold rounded-full shadow-xl select-none cursor-pointer outline-none focus:ring-4 focus:ring-pink-300 whitespace-nowrap active:scale-95 overflow-hidden"
            style={{ fontSize: "clamp(13px, 4vw, 17px)" }}
          >
            {/* Inner shimmer */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            YES ❤️
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ─── NO button — escapes cursor, fades behind growing YES ─── */}
      <motion.div
        ref={noDivRef}
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          zIndex: 20,
          translateX: noXSpring,
          translateY: noYSpring,
          rotate: noRotate,
          opacity: noOpacity,
          scale: noScale,
        }}
      >
        <button
          type="button"
          onClick={() => {
            const r = noDivRef.current?.getBoundingClientRect();
            if (r) dodge(r.left + r.width / 2, r.top + r.height / 2);
          }}
          onPointerDown={(e) => { e.preventDefault(); dodge(e.clientX, e.clientY); }}
          onTouchStart={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            dodge(t.clientX, t.clientY);
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 border-pink-300 text-pink-700 bg-white/50 active:bg-white/70 font-semibold shadow-md select-none touch-none outline-none whitespace-nowrap"
          style={{ fontSize: "clamp(11px, 3.5vw, 14px)" }}
        >
          {noText}
        </button>
      </motion.div>
    </div>
  );
}
