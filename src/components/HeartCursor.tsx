"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const COLORS = ["#ff69b4", "#ff1493", "#ffb6c1", "#ff85a2", "#ffd700", "#da70d6"];

export default function HeartCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastPosition = useRef({ x: 0, y: 0 });

  // Mouse coordinates using MotionValues
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for cursor follow effect (tuned to be slower and floatier)
  const springConfig = { damping: 35, stiffness: 100, mass: 0.8 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Detect desktop/mouse pointing device
    const mediaQuery = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    setIsDesktop(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    // Apply custom cursor hiding class to body
    document.body.classList.add("custom-cursor-enabled");

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      cursorX.set(x - 8); // Offset half cursor size (16px wide / 2 = 8px)
      cursorY.set(y - 8);

      // Check distance from last sparkle to throttle spawning
      const dx = x - lastPosition.current.x;
      const dy = y - lastPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 15) {
        const id = Date.now() + Math.random();
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newSparkle: Sparkle = {
          id,
          x,
          y,
          size: Math.random() * 10 + 6, // 6px to 16px
          color: randomColor,
        };

        setSparkles((prev) => [...prev.slice(-30), newSparkle]); // Limit array length to 30 items
        lastPosition.current = { x, y };

        // Clean up this sparkle after animation completes (800ms)
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== id));
        }, 800);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDesktop, cursorX, cursorY]);

  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Sparkles Trail */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            color: sparkle.color,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Star SVG */}
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 12.14 2 7.27l6.91-1.01L12 0z" />
          </svg>
        </span>
      ))}

      {/* Floating Heart Cursor */}
      <motion.div
        className="absolute w-5 h-5 text-pink-600 fill-current drop-shadow-[0_2px_4px_rgba(219,39,119,0.4)]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
    </div>
  );
}
