"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

interface FallingHeart {
  id: number;
  x: number; // percentage
  size: number;
  delay: number;
  duration: number;
  color: string;
  sway: number;
}

const HEART_COLORS = ["#ff2a6d", "#ff69b4", "#ff1493", "#ff85a2", "#ff4f79", "#e0115f"];

export default function YesCelebration() {
  const [fallingHearts, setFallingHearts] = useState<FallingHeart[]>([]);

  useEffect(() => {
    // 1. Play Synthesized Chime + Warm Chord
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Sparkly chime arpeggio
        const chimeNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 -> E5 -> G5 -> C6 -> E6 -> G6
        chimeNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gainNode.gain.setValueAtTime(0, now + i * 0.08);
          gainNode.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.5);
        });

        // Lush romantic Fmaj7/C major chord
        const chord = [261.63, 329.63, 392.0, 493.88, 523.25]; // C4, E4, G4, B4, C5
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + 0.4);

          gainNode.gain.setValueAtTime(0, now + 0.4);
          gainNode.gain.linearRampToValueAtTime(0.15, now + 0.4 + 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + 2.0);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now + 0.4);
          osc.stop(now + 0.4 + 2.0);
        });
      }
    } catch (e) {
      console.warn("AudioContext block/error:", e);
    }

    // 2. Huge Initial Confetti Explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd", "#f7cad0"],
    });

    // 3. Fireworks Effect (6 seconds)
    const end = Date.now() + 6000;
    const fireworksInterval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(fireworksInterval);
        return;
      }
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ["#ff0a54", "#ff85a1", "#fda085", "#fecfef"],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ["#ff0a54", "#ff85a1", "#fda085", "#fecfef"],
      });
    }, 300);

    // 4. Generate Heart Rain data
    const hearts = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 18 + 12, // 12px to 30px
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 5, // 5s to 11s
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      sway: Math.random() * 40 - 20, // -20px to +20px sway
    }));
    setFallingHearts(hearts);

    return () => {
      clearInterval(fireworksInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Falling Hearts Rain */}
      {fallingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            top: "-40px",
            width: heart.size,
            height: heart.size,
            color: heart.color,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, heart.sway, -heart.sway, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: {
              duration: heart.duration,
              repeat: Infinity,
              ease: "linear",
              delay: heart.delay,
            },
            x: {
              duration: heart.duration / 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: heart.delay,
            },
            rotate: {
              duration: heart.duration,
              repeat: Infinity,
              ease: "linear",
              delay: heart.delay,
            },
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full fill-current drop-shadow-sm"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
