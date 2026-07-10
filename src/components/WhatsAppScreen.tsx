"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { WHATSAPP_PHONE, WHATSAPP_MESSAGE } from "../config/whatsapp.config";

// Build the official wa.me deep-link
const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// ── WhatsApp SVG icon (official shape) ────────────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 .5C7.44.5.5 7.44.5 16c0 2.83.74 5.49 2.03 7.8L.5 31.5l7.89-2.07A15.44 15.44 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5z"
        fill="#25D366"
      />
      <path
        d="M23.5 20.1c-.34-.17-2-.99-2.31-1.1-.31-.12-.54-.17-.77.17-.22.34-.88 1.1-1.08 1.33-.2.22-.4.25-.74.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.43-.03-.6-.08-.17-.77-1.86-1.05-2.55-.28-.67-.56-.58-.77-.59h-.66c-.22 0-.57.08-.87.4-.3.31-1.14 1.11-1.14 2.72s1.17 3.16 1.33 3.38c.17.22 2.3 3.51 5.57 4.92.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.28-.76.28-1.41.2-1.55-.08-.14-.3-.22-.64-.39z"
        fill="#fff"
      />
    </svg>
  );
}

// ── Ripple hook ───────────────────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  }, []);

  return { ripples, addRipple };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WhatsAppScreen() {
  const { ripples, addRipple } = useRipple();

  return (
    <>

      <motion.div
        key="whatsapp"
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.1 }}
        className="w-full glass-card rounded-3xl px-6 py-8 sm:p-10 text-center shadow-2xl flex flex-col items-center gap-5 border-white/50"
      >
        {/* Animated Heart */}
        <motion.div
          animate={{ scale: [1, 1.18, 0.95, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl sm:text-6xl md:text-7xl filter drop-shadow-lg select-none"
        >
          ❤️
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-pink-900 leading-snug tracking-tight"
        >
          ❤️ Thank You for Saying Yes! ❤️
        </motion.h1>

        {/* Sub-message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-xs sm:text-sm md:text-base text-pink-800 font-medium leading-relaxed max-w-xs sm:max-w-sm"
        >
          Now send me your answer on WhatsApp by clicking the button below. 💬
        </motion.p>

        {/* WhatsApp Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs"
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl font-bold text-white text-base sm:text-lg shadow-lg shadow-green-500/30 select-none focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            onMouseDown={(e) => addRipple(e as unknown as React.MouseEvent<HTMLElement>)}
          >
            {/* Ripples */}
            {ripples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full bg-white/30 animate-ping"
                style={{
                  left: r.x - 40,
                  top: r.y - 40,
                  width: 80,
                  height: 80,
                  animationDuration: "0.7s",
                  animationIterationCount: 1,
                }}
              />
            ))}

            <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <span>Send on WhatsApp</span>

            {/* Hover shimmer */}
            <motion.span
              className="absolute inset-0 bg-white/10 rounded-2xl"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </a>

          {/* Hover scale wrapper */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-0"
            style={{ display: "contents" }}
          />
        </motion.div>

        {/* Tap hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-pink-600/60 font-medium mt-1 select-none"
        >
          The message will appear automatically in the chat ✨
        </motion.p>

      </motion.div>
    </>
  );
}
