import Link from "next/link";
import { Zap, ShieldCheck, Cpu, Sliders, ArrowRight, Award, Compass, Eye } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#090a0f] text-slate-100 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full border border-[#00e5ff]/20">
            Our Engineering Philosophy
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Illuminating the Frontiers of Creation &amp; Exploration.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            At Xevora, we believe light is not just about visibility—it is a creative instrument and a life-saving tool. We engineer optical systems for those who refuse to be bound by darkness.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Born from the Demands of the Field</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mainstream flashlights force you into compromises: fixed beam angles, washed-out color temperatures, sealed batteries that leave you stranded, or plastic housings that fail in bad weather.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We started Xevora Lights to engineer the uncompromising solution: a monolithic 6061-T6 aerospace aluminium body, swappable 10,000&nbsp;mAh triple-cell power, quad-spectrum selectable wavelengths, and precision telescopic optical zoom.
            </p>
          </div>
          <div className="rounded-2xl bg-black/60 border border-white/10 p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">1,200m Beam Collimation</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              Every reflector and aspheric lens element is diamond-turned to within nanometer tolerances.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#00e5ff]" />
            <h3 className="text-base font-bold text-white">Aerospace Ruggedness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CNC machined from solid billets of 6061-T6 alloy with type-III hard anodizing and splash-resistant O-ring seals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <Cpu className="w-6 h-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">Smart Power Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Digital OLED monitoring with active thermal throttle prevention and swappable 18650 cell compatibility.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <Eye className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Cinematographer Grade</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full spectrum output with 4 quick-switch color wavelengths and bundled 20 GOBO pattern projection capabilities.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-12 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Experience the Flagship G-Flash</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Ready to see what 10,000&nbsp;mAh and quad &ldquo;white-laser&rdquo; optical zoom can do on your next shoot?
          </p>
          <div className="pt-2">
            <Link href="/products/g-flash-series" className="btn-accent px-8 py-3 text-xs font-bold inline-flex items-center gap-2">
              Explore G-Flash Series <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
