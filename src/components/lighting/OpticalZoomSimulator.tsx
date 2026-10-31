"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Maximize2, Minimize2, Crosshair, Zap } from "lucide-react";

export default function OpticalZoomSimulator() {
  // zoom: 0 = Full Flood (120°), 100 = Full Spot (5°)
  const [zoomLevel, setZoomLevel] = useState<number>(50);

  // Computed metrics based on zoom level
  const angle = Math.round(120 - (zoomLevel / 100) * 115); // 120° down to 5°
  const throwDistance = Math.round(80 + (zoomLevel / 100) * 1120); // 80m to 1200m
  const intensityLux = Math.round(1500 + Math.pow(zoomLevel / 100, 2) * 85000); // 1.5k lux to 86.5k lux peak center

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#07080c] border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-[#00e5ff] mb-4">
            <Sliders className="w-3.5 h-3.5" />
            Telescopic Optical Zoom Engine
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Seamless Flood to Spot.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-white">
              Optical Precision in Motion.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Slide the telescopic CNC aluminium collar to glide between an ultra-wide 120° room-filling floodlight and a laser-like 1,200-meter search beam.
          </p>
        </div>

        {/* Simulator Container */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          {/* Visual Display Screen */}
          <div className="relative h-[320px] sm:h-[380px] bg-black rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6">
            {/* Grid Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#222b3d_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            {/* Target Distance Markers */}
            <div className="absolute right-4 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono text-zinc-600 border-l border-zinc-800 pl-3">
              <span>1200m (Target Focus)</span>
              <span>600m</span>
              <span>100m (Wide Wash)</span>
            </div>

            {/* Beam Visualizer */}
            <div className="relative w-full max-w-lg flex items-center justify-center">
              {/* Flashlight Head */}
              <div className="relative z-20 flex items-center">
                <div className="w-20 h-10 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/20 rounded-l-md flex items-center justify-center text-[9px] font-mono text-zinc-400">
                  XEVORA
                </div>
                {/* Telescopic Extension Segment */}
                <motion.div
                  animate={{ width: 12 + (zoomLevel / 100) * 18 }}
                  className="h-9 bg-zinc-700 border-y border-white/20"
                />
                <div className="w-8 h-12 bg-gradient-to-r from-zinc-800 to-zinc-700 border-y border-r border-white/30 rounded-r-md flex items-center justify-center relative">
                  <div className="w-1.5 h-10 bg-cyan-400 rounded-full shadow-[0_0_12px_#00e5ff]" />
                </div>
              </div>

              {/* Dynamic Optical Cone */}
              <motion.div
                animate={{
                  height: 260 - (zoomLevel / 100) * 210, // from 260px down to 50px
                  width: 180 + (zoomLevel / 100) * 140, // reaches further as it zooms
                  opacity: 0.85 + (zoomLevel / 100) * 0.15
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute left-[54%] origin-left pointer-events-none rounded-r-full"
                style={{
                  background: `linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(0,229,255,${0.6 + (zoomLevel / 100) * 0.3}) 40%, transparent 100%)`,
                  filter: `blur(${Math.max(2, 10 - (zoomLevel / 100) * 8)}px)`,
                  clipPath: `polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)`
                }}
              />
            </div>

            {/* Target Reticle Indicator */}
            <div className="absolute right-12 z-10 flex flex-col items-center">
              <Crosshair
                className={`w-8 h-8 transition-all duration-300 ${
                  zoomLevel > 75 ? "text-cyan-400 animate-pulse scale-125" : "text-zinc-600"
                }`}
              />
              <span className="text-[10px] font-mono text-zinc-400 mt-1">
                {zoomLevel > 75 ? "Target Locked" : "Area Illumination"}
              </span>
            </div>
          </div>

          {/* Slider & Quick Selection Controls */}
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Wide Flood (120°)
                </span>
              </div>

              {/* Interactive Range Input */}
              <div className="w-full sm:w-2/3 range-slider-container px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Pinpoint Spot (5°)
                </span>
                <Maximize2 className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "120° Wide Flood (Camp / Room)", val: 0 },
                { label: "60° Balanced Beam (Trail / Path)", val: 50 },
                { label: "5° Long-Throw Spot (Search / 1200m)", val: 100 }
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setZoomLevel(preset.val)}
                  className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    zoomLevel === preset.val
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Beam Angle
                </div>
                <div className="text-lg sm:text-2xl font-bold text-white">
                  {angle}°
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Throw Distance
                </div>
                <div className="text-lg sm:text-2xl font-bold text-cyan-400">
                  {throwDistance}m
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  Center Lux
                </div>
                <div className="text-lg sm:text-2xl font-bold text-amber-400">
                  {intensityLux.toLocaleString()} lx
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
