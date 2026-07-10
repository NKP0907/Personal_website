"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingHearts from "../components/FloatingHearts";
import MusicPlayer from "../components/MusicPlayer";
import ProposalButtons from "../components/ProposalButtons";
import YesCelebration from "../components/YesCelebration";
import WhatsAppScreen from "../components/WhatsAppScreen";

type Step = "landing" | "proposal" | "celebration" | "success";

export default function Home() {
  const [step, setStep]                 = useState<Step>("landing");
  const [musicStarted, setMusicStarted] = useState(false);

  const handleContinue = () => { setMusicStarted(true); setStep("proposal"); };
  const handleYes      = () => setStep("celebration");

  // Auto-advance from celebration → success after confetti finishes (~6s)
  useEffect(() => {
    if (step !== "celebration") return;
    const timer = setTimeout(() => setStep("success"), 6500);
    return () => clearTimeout(timer);
  }, [step]);

  const isCelebrationOrSuccess = step === "celebration" || step === "success";

  return (
    <main
      className={`relative min-h-screen min-h-dvh w-full flex flex-col items-center justify-center px-4 py-8 overflow-hidden transition-all duration-1000 select-none ${
        isCelebrationOrSuccess ? "bg-romantic-gradient-bright" : "bg-romantic-gradient"
      }`}
    >
      {/* Background layers */}
      {!isCelebrationOrSuccess && <FloatingHearts />}
      {step === "celebration"   && <YesCelebration />}
      {step === "success"       && <FloatingHearts />}
      <MusicPlayer startTrigger={musicStarted} />

      {/* Card wrapper */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg z-30 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* ── LANDING ── */}
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full glass-card rounded-3xl px-6 py-8 sm:p-10 text-center shadow-xl flex flex-col items-center gap-5"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl sm:text-6xl"
              >
                Hi ❤️
              </motion.div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-900 tracking-tight leading-snug">
                I have something special to ask you...
              </h1>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="mt-2 px-8 py-3 sm:py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm sm:text-base active:scale-95"
              >
                Continue ✨
              </motion.button>
            </motion.div>
          )}

          {/* ── PROPOSAL ── */}
          {step === "proposal" && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full glass-card rounded-3xl px-5 py-7 sm:p-10 text-center shadow-xl flex flex-col items-center gap-4 sm:gap-6"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl sm:text-6xl md:text-7xl filter drop-shadow-md select-none"
              >
                ❤️
              </motion.div>

              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-pink-900 leading-snug tracking-tight">
                Will You Be My Girlfriend? ❤️
              </h2>

              <div className="space-y-2 sm:space-y-3 text-pink-950 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-xs sm:max-w-sm">
                <p>Every moment with you makes my life more beautiful.</p>
                <p>You make me smile even on my worst days.</p>
                <p>I don&apos;t want to imagine my future without you.</p>
                <p className="font-semibold text-pink-950 mt-3 text-sm sm:text-base md:text-lg">
                  Will you stay with me forever?
                </p>
              </div>

              <ProposalButtons onYes={handleYes} />
            </motion.div>
          )}

          {/* ── CELEBRATION ── */}
          {step === "celebration" && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="w-full glass-card rounded-3xl px-6 py-8 sm:p-10 text-center shadow-2xl flex flex-col items-center gap-5 border-white/50"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 0.9, 1.1, 1], rotate: [0, 10, -10, 5, 0] }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-5xl sm:text-6xl md:text-7xl filter drop-shadow-md select-none"
              >
                🎉💖
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 tracking-wider py-1 animate-pulse">
                YAY!! ❤️
              </h1>

              <p className="text-base sm:text-lg md:text-xl font-bold text-pink-900 leading-relaxed max-w-xs sm:max-w-sm mt-1">
                You just made me the happiest person in the world.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-pink-600 text-2xl sm:text-3xl mt-2 select-none animate-bounce"
              >
                😘🥰👩‍❤️‍👨
              </motion.div>

              {/* Subtle progress indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="flex flex-col items-center gap-2 mt-2"
              >
                <p className="text-xs text-pink-600/70 font-medium">One more step...</p>
                <motion.div
                  className="h-1 rounded-full bg-pink-300/50 w-32"
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.5, delay: 3, ease: "linear" }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* ── SUCCESS / WHATSAPP ── */}
          {step === "success" && (
            <WhatsAppScreen key="success" />
          )}

        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 1 }}
          className="mt-6 text-pink-700 text-xs font-semibold tracking-wide drop-shadow-sm select-none text-center"
        >
          Made with ❤️ just for you.
        </motion.p>
      </div>
    </main>
  );
}
