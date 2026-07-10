"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Heart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  swayDuration: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate hearts on client-side only to prevent SSR layout shifts
    const newHearts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen
      size: Math.random() * 20 + 12, // 12px to 32px
      duration: Math.random() * 15 + 12, // 12s to 27s
      delay: Math.random() * -20, // negative delay so some start midway
      opacity: Math.random() * 0.25 + 0.1, // 0.1 to 0.35 opacity
      swayDuration: Math.random() * 4 + 3, // 3s to 7s sway frequency
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-500 fill-current"
          style={{
            left: `${heart.x}%`,
            bottom: "-50px",
            width: heart.size,
            height: heart.size,
            opacity: heart.opacity,
          }}
          animate={{
            y: ["0vh", "-110vh"],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: {
              duration: heart.duration,
              repeat: Infinity,
              ease: "linear",
              delay: heart.delay,
            },
            rotate: {
              duration: heart.duration * 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: heart.delay,
            },
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
