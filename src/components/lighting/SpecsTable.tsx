"use client";

import React from "react";
import { Zap, Palette, Sliders, BatteryCharging, Cable, Gauge, Shield, Ruler, Droplets } from "lucide-react";

interface SpecItem {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}

const SPECIFICATIONS: SpecItem[] = [
  {
    icon: Zap,
    label: "Light source",
    value: 'Quad-source emitter ("white-laser"-type LED module)',
    highlight: true,
  },
  {
    icon: Palette,
    label: "Colour modes",
    value: "White  ·  Ice-blue  ·  Yellow  ·  Golden",
    highlight: true,
  },
  {
    icon: Sliders,
    label: "Zoom",
    value: "Telescopic optical zoom (flood ↔ spot)",
  },
  {
    icon: BatteryCharging,
    label: "Power",
    value: "3 × 18650 lithium cells — swappable (= 10,000 mAh combined)",
    highlight: true,
  },
  {
    icon: Cable,
    label: "Charging",
    value: "USB Type-C",
  },
  {
    icon: Gauge,
    label: "Display",
    value: "Digital readout (battery / mode)",
  },
  {
    icon: Shield,
    label: "Body / weight",
    value: "Aluminium alloy  ·  465 g",
  },
  {
    icon: Ruler,
    label: "Dimensions",
    value: "160 × 53 mm",
  },
  {
    icon: Droplets,
    label: "Water resistance",
    value: "Daily-life splash resistance",
  },
];

export default function SpecsTable() {
  return (
    <section id="specifications" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090a0f] border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full border border-[#00e5ff]/20">
            Engineered Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 tracking-tight">
            Technical Specifications
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every component crafted to aerospace tolerances for uncompromising reliability in the field.
          </p>
        </div>

        {/* Spec Table Container */}
        <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/[0.015] shadow-2xl backdrop-blur-md">
          <div className="divide-y divide-white/5">
            {SPECIFICATIONS.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div
                  key={idx}
                  className={`grid grid-cols-1 sm:grid-cols-12 p-5 sm:py-6 sm:px-8 transition-colors duration-200 hover:bg-white/[0.03] ${
                    idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                  }`}
                >
                  {/* Left Column: Label */}
                  <div className="sm:col-span-4 flex items-center gap-3 text-slate-300 font-semibold text-sm sm:text-base mb-1 sm:mb-0">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <Icon className="w-4 h-4 text-[#00e5ff]" />
                    </div>
                    <span>{spec.label}</span>
                  </div>

                  {/* Right Column: Exact Specification Value */}
                  <div className="sm:col-span-8 flex items-center text-slate-100 font-normal text-sm sm:text-base leading-relaxed pl-11 sm:pl-0">
                    <span className={spec.highlight ? "text-white font-medium" : "text-slate-300"}>
                      {spec.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* In The Box Visual Callout */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span>📦</span> What&apos;s Included In The Standard Package
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 1× Xevora G-Flash Quad-Source LED Light
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 3× 18650 Swappable Cells (10,000 mAh combined)
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 1× USB Type-C Fast-Charging Cable
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 1× Heavy-Duty Tactical Lanyard Clip
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 1× High-Impact Travel Protective Case
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              • 1× User Manual & 1-Year Warranty Card
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
