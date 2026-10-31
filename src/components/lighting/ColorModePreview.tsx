"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Eye, ShieldCheck } from "lucide-react";

interface ColorMode {
  id: string;
  name: string;
  label: string;
  temp: string;
  hex: string;
  glowColor: string;
  description: string;
  useCase: string;
}

const COLOR_MODES: ColorMode[] = [
  {
    id: "white",
    name: "Pure White",
    label: "White",
    temp: "6500K Daylight",
    hex: "#F8FAFC",
    glowColor: "rgba(248, 250, 252, 0.7)",
    description: "Ultra-bright true daylight penetration for long-range search & tactical clarity.",
    useCase: "Search & rescue, camping, wide-area illumination, key video light"
  },
  {
    id: "ice-blue",
    name: "Ice-Blue",
    label: "Ice-blue",
    temp: "460nm Cyan Wave",
    hex: "#00E5FF",
    glowColor: "rgba(0, 229, 255, 0.75)",
    description: "High-contrast tactical beam optimized for tracking, night fishing, and cinematic rim lighting.",
    useCase: "Cinematic portrait rim light, night tracking, blood/fluid detection, cyberpunk styling"
  },
  {
    id: "yellow",
    name: "Amber Yellow",
    label: "Yellow",
    temp: "3200K Tungsten",
    hex: "#FACC15",
    glowColor: "rgba(250, 204, 21, 0.75)",
    description: "Maximum penetrating warm wavelength engineered to slice through dense fog, rain, and haze.",
    useCase: "Foggy weather driving, haze piercing, warm ambient portraiture, reading"
  },
  {
    id: "golden",
    name: "Deep Golden",
    label: "Golden",
    temp: "2200K Sunset Flame",
    hex: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.75)",
    description: "Soothing golden hour warmth creating dramatic cinematic background washes and vintage mood.",
    useCase: "Golden hour fill, fireside warmth, creative GOBO background projection, cozy bivouac"
  }
];

export default function ColorModePreview() {
  const [activeMode, setActiveMode] = useState<ColorMode>(COLOR_MODES[0]);

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#0a0c12]">
      {/* Dynamic ambient backdrop illumination based on selected color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-25"
        style={{ backgroundColor: activeMode.hex }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-[#00e5ff] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Quad-Source Emitter Tech
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Four Spectrum Modes.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">
              One Switch Mastery.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Switch effortlessly between daylight search, fog-piercing amber, golden hour ambiance, and high-contrast ice-blue with a single touch.
          </p>
        </div>

        {/* Interactive Beam Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
          
          {/* Left: Mode Selection Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
              Select Color Spectrum
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {COLOR_MODES.map((mode) => {
                const isSelected = activeMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                      isSelected
                        ? "bg-white/10 border-white/30 shadow-lg"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="w-4 h-4 rounded-full border border-white/40 shadow-sm transition-transform group-hover:scale-110"
                        style={{ backgroundColor: mode.hex }}
                      />
                      <span className="text-sm font-semibold text-white">
                        {mode.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {mode.temp}
                    </div>

                    {isSelected && (
                      <motion.div
                        layoutId="active-mode-indicator"
                        className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
                        style={{ borderColor: mode.hex }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Details Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-6 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Wavelength Profile
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white">
                    {activeMode.temp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeMode.description}
                </p>
                <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                  <span className="text-slate-200 font-semibold">Recommended for: </span>
                  {activeMode.useCase}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Realistic Virtual Beam Visualizer */}
          <div className="lg:col-span-7 relative h-[360px] sm:h-[420px] rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center p-6">
            {/* Background Grid Room */}
            <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            {/* Simulated Flashlight Projector */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Flashlight Body */}
              <div className="relative flex items-center">
                {/* Tail / Swappable 3x18650 Battery Compartment */}
                <div className="w-24 sm:w-32 h-14 bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800 rounded-l-xl border-y border-l border-white/20 flex flex-col justify-between p-2 shadow-2xl">
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                    <span>XEVORA</span>
                    <span className="text-emerald-400">● 100%</span>
                  </div>
                  {/* Digital OLED simulation */}
                  <div className="bg-black/90 rounded border border-white/10 p-1 flex items-center justify-between font-mono text-[9px]">
                    <span className="text-cyan-400">G-FLASH</span>
                    <span style={{ color: activeMode.hex }}>{activeMode.label.toUpperCase()}</span>
                  </div>
                  <div className="text-[8px] text-zinc-500 text-right">3× 18650 LI-ION</div>
                </div>

                {/* Telescopic Head & Optical Collar */}
                <div className="w-16 sm:w-20 h-18 bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-600 rounded-r-lg border-y border-r border-white/30 flex items-center justify-center relative shadow-lg">
                  <div className="w-3 h-12 bg-zinc-900/80 rounded border-y border-white/10" />
                  {/* Lens Emitter Ring */}
                  <div
                    className="absolute -right-2 w-4 h-16 rounded-r-full border-r-2 border-white transition-all duration-500"
                    style={{
                      boxShadow: `0 0 25px 5px ${activeMode.glowColor}`,
                      backgroundColor: activeMode.hex
                    }}
                  />
                </div>

                {/* Cast Light Cone Beam */}
                <motion.div
                  key={activeMode.id}
                  initial={{ opacity: 0, scaleX: 0.8 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute left-[95%] sm:left-[96%] top-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] h-[220px] pointer-events-none origin-left"
                  style={{
                    background: `radial-gradient(ellipse at left, ${activeMode.glowColor} 0%, rgba(255,255,255,0.15) 30%, transparent 75%)`,
                    filter: "blur(8px)"
                  }}
                />
              </div>

              {/* Status readout label */}
              <div className="mt-8 text-center">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border"
                  style={{
                    color: activeMode.hex,
                    borderColor: `${activeMode.hex}40`,
                    backgroundColor: `${activeMode.hex}15`
                  }}
                >
                  Active Output: {activeMode.name} ({activeMode.temp})
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
