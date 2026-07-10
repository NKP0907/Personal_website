"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Music, Play, Pause, Volume2, VolumeX, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicPlayerProps {
  startTrigger: boolean;
}

// ─── 🎵 DEFAULT MUSIC FILE ────────────────────────────────────────────────────
// Place your audio file in:  c:\Users\nitin\Downloads\First\public\
// Change the filename below if your file has a different name:
const DEFAULT_MUSIC_FILE = "/WhatsApp Audio 2026-07-10 at 7.34.31 AM.mpeg";
const DEFAULT_MUSIC_NAME = "Our Song 💕"; // displayed in the badge
// ─────────────────────────────────────────────────────────────────────────────

// ─── Romantic Piano Melody Sequencer ─────────────────────────────────────────
const BPM = 60;
const BEAT = 60 / BPM;

const MELODY: [number, number, number][] = [
  [293.66, 2, 0.55],[329.63, 1, 0.45],[369.99, 2, 0.50],[440.00, 2, 0.55],
  [392.00, 1, 0.40],[329.63, 3, 0.50],[293.66, 1, 0.45],[261.63, 2, 0.50],
  [293.66, 2, 0.55],[329.63, 2, 0.45],[246.94, 1, 0.40],[220.00, 3, 0.50],
  [261.63, 2, 0.50],[293.66, 1, 0.45],[329.63, 2, 0.50],[369.99, 2, 0.55],
  [440.00, 1, 0.60],[493.88, 4, 0.55],[440.00, 1, 0.45],[392.00, 2, 0.50],
  [329.63, 2, 0.45],[293.66, 2, 0.50],[261.63, 4, 0.40],
];

const BASS_NOTES = [82.41, 110.0, 146.83];

function createRomanticMelody(ctx: AudioContext, masterGain: GainNode) {
  let scheduledUntil = ctx.currentTime + 0.1;
  let noteIndex = 0;
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  // Soft reverb
  const convolver = ctx.createConvolver();
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.18;
  const irLength = ctx.sampleRate * 1.5;
  const irBuffer = ctx.createBuffer(2, irLength, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = irBuffer.getChannelData(ch);
    for (let i = 0; i < irLength; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLength, 3);
  }
  convolver.buffer = irBuffer;
  convolver.connect(reverbGain);
  reverbGain.connect(masterGain);

  // Bass pad
  BASS_NOTES.forEach((freq) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.value = 0.04;
    osc.connect(g);
    g.connect(masterGain);
    osc.start(ctx.currentTime + 0.1);
  });

  const schedule = () => {
    while (scheduledUntil < ctx.currentTime + 4) {
      const [freq, beats, vel] = MELODY[noteIndex % MELODY.length];
      const dur = beats * BEAT;
      const t = scheduledUntil;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const atk = 0.03, dec = 0.12, sus = vel * 0.6, rel = Math.min(dur * 0.4, 0.5);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(vel * 0.7, t + atk);
      env.gain.linearRampToValueAtTime(sus, t + atk + dec);
      env.gain.setValueAtTime(sus, t + dur - rel);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(env);
      env.connect(masterGain);
      const send = ctx.createGain();
      send.gain.value = 0.25;
      env.connect(send);
      send.connect(convolver);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      scheduledUntil += dur;
      noteIndex = (noteIndex + 1) % MELODY.length;
    }
    timeouts.push(setTimeout(schedule, 1500));
  };

  schedule();
  return () => timeouts.forEach(clearTimeout);
}

export default function MusicPlayer({ startTrigger }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying]   = useState(false);
  const [isMuted, setIsMuted]       = useState(false);
  const [trackName, setTrackName]   = useState(DEFAULT_MUSIC_NAME);
  const [useUpload, setUseUpload]   = useState(false); // true = HTML Audio; false = synth

  // Synth refs
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const masterGainRef  = useRef<GainNode | null>(null);
  const cleanupRef     = useRef<(() => void) | null>(null);
  const hasStartedRef  = useRef(false);

  // HTML Audio ref (default file OR uploaded file)
  const audioElemRef  = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef    = useRef<string | null>(null);

  // Hidden file input ref
  const fileInputRef  = useRef<HTMLInputElement | null>(null);

  // ── Try loading the default music file on mount ───────────────────────────
  useEffect(() => {
    const audio = new Audio(DEFAULT_MUSIC_FILE);
    audio.loop   = true;
    audio.volume = 0.65;
    audio.preload = "auto";

    const onCanPlay = () => {
      // File exists and is playable — use it as default
      audioElemRef.current = audio;
      setUseUpload(true);
      setTrackName(DEFAULT_MUSIC_NAME);
    };

    const onError = () => {
      // File not found — fall back to synthesizer, rename badge
      setTrackName("Romantic Piano");
      setUseUpload(false);
    };

    audio.addEventListener("canplaythrough", onCanPlay, { once: true });
    audio.addEventListener("error", onError, { once: true });
    audio.load();

    return () => {
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.pause();
    };
  }, []);

  // ── Synth controls ────────────────────────────────────────────────────────
  const startSynth = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx() as AudioContext;
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : 0.55;
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
      cleanupRef.current = createRomanticMelody(ctx, gain);
      setIsPlaying(true);
    } catch {}
  }, [isMuted]);

  const stopSynth = useCallback(() => {
    cleanupRef.current?.();
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    masterGainRef.current = null;
    hasStartedRef.current = false;
    setIsPlaying(false);
  }, []);

  // ── Uploaded audio controls ───────────────────────────────────────────────
  const startUploadedAudio = useCallback(async () => {
    const el = audioElemRef.current;
    if (!el) return;
    try {
      el.muted = isMuted;
      await el.play();
      setIsPlaying(true);
    } catch {}
  }, [isMuted]);

  const stopUploadedAudio = useCallback(() => {
    const el = audioElemRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setIsPlaying(false);
  }, []);

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop whatever is playing
    if (useUpload) stopUploadedAudio(); else stopSynth();

    // Revoke old blob
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.65;
    audioElemRef.current = audio;

    setTrackName(file.name.replace(/\.[^/.]+$/, ""));
    setUseUpload(true);
    hasStartedRef.current = false;

    // Auto-play the uploaded track
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  // ── Toggle play/pause ─────────────────────────────────────────────────────
  const togglePlay = () => {
    if (useUpload) {
      isPlaying ? stopUploadedAudio() : startUploadedAudio();
    } else {
      if (isPlaying) {
        stopSynth();
      } else {
        hasStartedRef.current = false;
        startSynth();
      }
    }
  };

  // ── Toggle mute ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (useUpload && audioElemRef.current) {
      audioElemRef.current.muted = next;
    } else if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        next ? 0 : 0.55, audioCtxRef.current.currentTime, 0.1
      );
    }
  };

  // ── Start on trigger ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!startTrigger) return;
    if (useUpload) { startUploadedAudio(); } else { startSynth(); }
  }, [startTrigger]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopSynth();
      audioElemRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5">
      {/* Now Playing badge — hidden on very small screens */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-xs font-medium text-pink-700 shadow-sm max-w-[140px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="shrink-0"
            >
              <Music className="w-3 h-3" />
            </motion.div>
            <span className="truncate">{trackName}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls pill */}
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg text-pink-700"
      >
        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-full hover:bg-white/40 transition-colors duration-200 focus:outline-none"
          title="Upload your music 🎵"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-full hover:bg-white/40 transition-colors duration-200 focus:outline-none"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying
            ? <Pause className="w-3.5 h-3.5 fill-pink-700/20" />
            : <Play  className="w-3.5 h-3.5 fill-pink-700" />}
        </button>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-full hover:bg-white/40 transition-colors duration-200 focus:outline-none"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted
            ? <VolumeX className="w-3.5 h-3.5 text-pink-400" />
            : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </motion.div>

      {/* Hidden file input — accepts all audio formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
