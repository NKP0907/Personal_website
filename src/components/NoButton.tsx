"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const NO_TEXTS = [
  "No 🙈",
  "Think Again 😅",
  "Really? 🥺",
  "Are You Sure? 💔",
  "Catch Me 😂",
  "Impossible 😜",
  "Try Again ❤️",
  "No way! 🫣",
  "Pretty please? 🥺",
  "Don't do this! 😭",
];

export default function NoButton() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [text, setText] = useState("No 💔");
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const dodge = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    
    // Viewport dimensions
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate maximum/minimum allowed offsets relative to current layout position
    const minX = -rect.left + 20;
    const maxX = vw - rect.right - 20;
    const minY = -rect.top + 20;
    const maxY = vh - rect.bottom - 20;

    // Pick random target offsets
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;

    // Make sure it moves at least 80px to feel like a real escape
    const currentX = coords.x;
    const currentY = coords.y;
    const distance = Math.sqrt((randomX - currentX) ** 2 + (randomY - currentY) ** 2);
    
    if (distance < 80) {
      // Recurse once if the escape is too small
      return dodge();
    }

    setCoords({ x: randomX, y: randomY });

    // Rotate and scale randomly
    setRotate((Math.random() - 0.5) * 30); // -15deg to +15deg
    setScale(Math.random() * 0.3 + 0.85); // 0.85 to 1.15

    // Change text randomly
    const currentIndex = NO_TEXTS.indexOf(text);
    let nextIndex = Math.floor(Math.random() * NO_TEXTS.length);
    if (nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % NO_TEXTS.length;
    }
    setText(NO_TEXTS[nextIndex]);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      // Distance from mouse to button center
      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Dodge if cursor comes within 100 pixels
      if (distance < 100) {
        dodge();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [coords, text]);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        dodge();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        dodge();
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        dodge();
      }}
      onFocus={(e) => {
        e.preventDefault();
        dodge();
      }}
      animate={{
        x: coords.x,
        y: coords.y,
        scale: scale,
        rotate: rotate,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 22,
      }}
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.9 }}
      className="px-6 py-3 md:px-7 md:py-3.5 rounded-full border-2 border-pink-300 text-pink-700 bg-white/40 hover:bg-white/60 font-semibold shadow-md transition-colors duration-200 select-none z-40 touch-none outline-none focus:ring-2 focus:ring-pink-400"
    >
      {text}
    </motion.button>
  );
}
