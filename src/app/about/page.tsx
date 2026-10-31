import Link from "next/link";
import {
  Focus,
  Gauge,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Wind,
  Palette,
  Film,
  Award,
  Star,
  CheckCircle,
  Layers,
  ChevronRight,
  Crosshair
} from "lucide-react";

export const metadata = {
  title: "About Xevora | Optics Lab & Cinematography Engineering",
  description:
    "Born from high-tolerance CNC metalcraft and astronomical projection lens design. Learn the Kyoto × Berlin origin story behind Xevora G-Flash optical lighting systems.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#0e0e12] text-[#e4e1e7] min-h-screen">
      
      {/* ── 1. BRAND HERO BANNER ─────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden pt-28 pb-20 lg:pb-32 bg-surface-container-lowest border-b border-white/5">
        {/* Ambient Dark Atmospheric Background */}
        <div
          className="absolute inset-0 z-0 opacity-25 mix-blend-screen pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: "url('/images/about/hero-optics-lab.jpg')" }}
        />
        <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-primary-container/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-12 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-8">
          
          {/* Top Status Tags */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase tracking-widest flex items-center gap-2 border border-white/5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              LAB REPORT // REF. XVR-GENESIS
            </span>
            <span className="text-secondary font-mono text-xs uppercase tracking-wider">
              EST. 2021 // KYOTO × BERLIN
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            
            <div className="lg:col-span-8 flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06]">
                Engineering Light for the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-primary-container">
                  Modern Cinematic Visionary
                </span>
                .
              </h1>
              <p className="text-base sm:text-lg text-secondary max-w-2xl leading-relaxed">
                Born from high-tolerance CNC metalcraft and astronomical projection lens design. We compressed monolithic studio spotlights into modular, handheld hyper-emitters that travel anywhere your camera takes you.
              </p>
            </div>

            {/* Right Metric Cards */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 lg:pl-6">
              
              <div className="p-5 rounded-2xl bg-surface-container-low shadow-xl flex items-center justify-between border border-white/5">
                <div>
                  <div className="font-mono text-xs text-secondary uppercase tracking-wider">
                    Optical Efficiency
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mt-1">94.8%</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container text-primary border border-white/5">
                  <Crosshair className="w-6 h-6 text-primary-container" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low shadow-xl flex items-center justify-between border border-white/5">
                <div>
                  <div className="font-mono text-xs text-secondary uppercase tracking-wider">
                    Weight Reduction
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary mt-1">-82% Mass</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container text-primary border border-white/5">
                  <Gauge className="w-6 h-6 text-primary-container" />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 2. THE PROBLEM & OUR MISSION (ASYMMETRIC SPLIT) ────────────────── */}
      <section className="w-full py-20 lg:py-28 bg-surface border-b border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col gap-2">
            <span className="text-primary font-mono text-xs uppercase tracking-widest font-semibold">
              01 / The Creative Friction
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight max-w-2xl">
              Heavy Metal Rigs belong in 1998. Fast cinema needs agility.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* The Problem Card (Left) */}
            <div className="lg:col-span-5 p-8 lg:p-10 rounded-2xl bg-surface-container-low shadow-xl flex flex-col justify-between gap-8 border border-white/5">
              <div className="flex flex-col gap-6">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary border border-white/5">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">The 20-Kilogram Deadweight</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Traditional high-output cinema lights require heavy duty C-stands, hot-shoe ballasts, bulky external inverters, and two crew members just to reposition for a close-up. Solo documentary directors and boutique studios were locked into cumbersome production overhead.
                  </p>
                </div>
                
                <ul className="flex flex-col gap-3 text-xs sm:text-sm text-secondary">
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Hours wasted rigging cables and sandbags</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Unusable in tight guerilla urban locations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Noisy cooling fans ruin sensitive on-mic audio</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-surface-container text-secondary font-mono text-xs border border-white/5 italic">
                FIELD LOG: &ldquo;More time adjusting ballast stands than directing performance.&rdquo;
              </div>
            </div>

            {/* The Solution Showcase (Right) */}
            <div className="lg:col-span-7 p-8 lg:p-10 rounded-2xl bg-surface-container-high shadow-2xl flex flex-col justify-between gap-8 relative overflow-hidden border border-primary-container/20">
              <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-primary-container/15 blur-3xl pointer-events-none" />
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs text-primary font-bold px-3 py-1 rounded bg-surface-container border border-white/5">
                    SOLVED // G-SERIES ARCHITECTURE
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-white">The Pocket Optic Engine</h3>
                  <p className="text-base text-secondary leading-relaxed">
                    We engineered an aerospace-grade 6061-T6 aluminum optical chassis featuring micro-machined internal heat pipes and multi-coated aspheric quartz optics. The result: raw high-output throw in a chassis the exact volume of a 35mm cinema lens.
                  </p>
                </div>

                {/* Mini Spec Comparison Grid */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
                    <span className="font-mono text-[10px] text-secondary uppercase font-semibold">Weight</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">485g</span>
                    <span className="text-xs text-secondary">Pocket portable</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
                    <span className="font-mono text-[10px] text-secondary uppercase font-semibold">Color Rec</span>
                    <span className="text-xl sm:text-2xl font-bold text-white">CRI 98.4</span>
                    <span className="text-xs text-secondary">Zero green cast</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
                    <span className="font-mono text-[10px] text-secondary uppercase font-semibold">Acoustics</span>
                    <span className="text-xl sm:text-2xl font-bold text-white">&lt; 14 dB</span>
                    <span className="text-xs text-secondary">Whisper silent</span>
                  </div>
                </div>
              </div>

              {/* Hardware Photo Callout */}
              <div
                className="relative z-10 w-full h-60 rounded-xl overflow-hidden shadow-inner bg-cover bg-center border border-white/10 group"
                style={{ backgroundImage: "url('/images/about/pocket-optic-engine.jpg')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded bg-surface/90 backdrop-blur-md text-white font-mono text-xs flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                  <span>AEROSPACE CHASSIS // ASSEMBLED IN KYOTO</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 3. THREE ENGINEERING PILLARS ─────────────────────────────────── */}
      <section className="w-full py-20 lg:py-28 bg-surface-container-lowest border-b border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-primary font-mono text-xs uppercase tracking-widest font-semibold">
                02 / The Core Tenets
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                The Three Pillars of Xevora Optics
              </h2>
            </div>
            <p className="text-sm text-secondary max-w-md leading-relaxed">
              Every fastener, PCB line, and anti-reflective lens coating is scrutinized under rigorous optical laboratory benchmarking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 01 */}
            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col justify-between gap-8 group hover:bg-surface-container transition-colors border border-white/5">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary">01</span>
                  <div className="p-2.5 rounded-xl bg-surface-container-high text-primary border border-white/5">
                    <Eye className="w-5 h-5 text-primary-container" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white">True In-Camera Optical Effects</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    We integrate custom-etched precision GOBO slides directly within optical focus channels. Project blinds, atmospheric shafts, and laser-crisp geometric shadows without relying on green screens or costly VFX passes.
                  </p>
                </div>
              </div>

              {/* Wavefront Beam Graphic */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3 border border-white/5">
                <div className="flex justify-between items-center text-secondary font-mono text-xs">
                  <span>BEAM SPREAD CALIBRATION</span>
                  <span className="text-primary font-bold">15° - 45°</span>
                </div>
                <svg className="w-full h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 280 48">
                  <path d="M10 24h60l30-18h80l30 18h60" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M10 24h60l30 18h80l30-18h60" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <circle cx="100" cy="6" fill="currentColor" r="3" />
                  <circle cx="180" cy="6" fill="currentColor" r="3" />
                  <circle cx="140" cy="24" fill="#E51A34" r="5" />
                </svg>
                <span className="text-xs text-secondary font-mono">Telecentric quartz condenser array</span>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col justify-between gap-8 group hover:bg-surface-container transition-colors border border-white/5">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary">02</span>
                  <div className="p-2.5 rounded-xl bg-surface-container-high text-primary border border-white/5">
                    <Wind className="w-5 h-5 text-primary-container" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white">Thermal Innovation &amp; Endurance</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Patented levitating magnetic bearing fans float inside vacuum-sealed copper vapor chambers. Run continuous 350-minute commercial sessions without thermal throttling, component degradation, or sound bleed.
                  </p>
                </div>
              </div>

              {/* Heat Dissipation Bar Graph */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col gap-3 border border-white/5">
                <div className="flex justify-between items-center text-secondary font-mono text-xs">
                  <span>ACTIVE HEAT DISSIPATION</span>
                  <span className="text-primary font-bold">42.1°C PEAK</span>
                </div>
                <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden flex">
                  <div className="bg-primary-container h-full w-[38%]" />
                  <div className="bg-primary h-full w-[22%]" />
                  <div className="bg-secondary-container h-full w-[40%]" />
                </div>
                <span className="text-xs text-secondary font-mono">Continuous full-lumen runtime: 350 min</span>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col justify-between gap-8 group hover:bg-surface-container transition-colors border border-white/5">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary">03</span>
                  <div className="p-2.5 rounded-xl bg-surface-container-high text-primary border border-white/5">
                    <Palette className="w-5 h-5 text-primary-container" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white">Hollywood Color Fidelity</h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Skin tones are sacred. We tune our customized phosphor arrays using the 99-color-patch TM-30 standard, guaranteeing pure skin rendering and natural shadow tonality without colorist correction hours.
                  </p>
                </div>
              </div>

              {/* Radial Spectrum Ring */}
              <div className="p-4 rounded-xl bg-surface-container-lowest flex items-center justify-between border border-white/5">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white">TLCI 99</span>
                  <span className="text-xs text-secondary font-mono">Television Consistency Index</span>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-primary-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="99, 100"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs text-white font-bold">99%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. ORIGINS & CRAFT (FOUNDER STORY & BLUEPRINT MOSAIC) ─────────── */}
      <section className="w-full py-20 lg:py-28 bg-surface border-b border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Mosaic (Left) */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div
                  className="rounded-2xl overflow-hidden h-64 bg-cover bg-center shadow-xl border border-white/5"
                  style={{ backgroundImage: "url('/images/about/cad-blueprint-lab.jpg')" }}
                />
                <div className="p-6 rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-1 border border-white/5">
                  <span className="font-mono text-xs text-primary font-bold">CAD SCHEMATIC REF: 44-X</span>
                  <p className="text-xs text-secondary leading-relaxed">
                    Every chamber is milled from a single cold-extruded block of 6061-T6 alloy.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 -mt-6">
                <div className="p-6 rounded-2xl bg-surface-container-high shadow-lg flex flex-col gap-1 border border-white/5">
                  <span className="text-lg font-bold text-white">&ldquo;Zero Compromise&rdquo;</span>
                  <span className="text-xs text-secondary leading-relaxed">
                    Founded by cinematographers frustrated by flimsy plastic field gear.
                  </span>
                </div>
                <div
                  className="rounded-2xl overflow-hidden h-72 bg-cover bg-center shadow-xl border border-white/5"
                  style={{ backgroundImage: "url('/images/about/founders-workshop.jpg')" }}
                />
              </div>
            </div>

            {/* Founder Narrative (Right) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-primary font-mono text-xs uppercase tracking-widest font-semibold">
                  03 / Origins &amp; Craft
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Precision Milled by Filmmakers for Filmmakers.
                </h2>
              </div>

              <div className="flex flex-col gap-4 text-secondary text-sm sm:text-base leading-relaxed">
                <p>
                  In 2021, co-founders <strong className="text-white">Kenji Morita</strong> (former senior optical lead at Kyoto Precision) and <strong className="text-white">Elias Vance</strong> (commercial director of photography) found themselves at a crossroads during a remote mountain commercial shoot in Hokkaido. A blizzard struck, batteries froze, and the 80kg lighting grip truck couldn’t make the pass.
                </p>
                <p>
                  They spent that night mapping out a new class of hardware: What if the beam intensity of a studio stage light lived inside a housing with the ergonomics of a telephoto lens? Six months later, the first G-Flash prototype was hand-machined on a 5-axis lathe.
                </p>
              </div>

              {/* Bench check badge */}
              <div className="p-5 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-bold border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-primary-container" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">Hand-Assembled Bench Check</div>
                    <div className="text-xs text-secondary font-mono">Every unit individually spectral-metered</div>
                  </div>
                </div>
                <span className="font-mono text-xs text-primary px-3 py-1.5 rounded-lg bg-surface-container border border-white/5 font-semibold">
                  TOLERANCE ±0.02MM
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 5. GLOBAL VALIDATION // METRICS ──────────────────────────────── */}
      <section className="w-full py-20 bg-surface-container-lowest border-b border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-primary font-mono text-xs uppercase tracking-widest font-semibold">
              GLOBAL VALIDATION // METRICS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Empowering Visual Architects Across 84 Countries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col items-center text-center gap-3 border border-white/5">
              <Film className="w-10 h-10 text-primary-container" />
              <div className="text-4xl font-extrabold text-white tracking-tight">50,000+</div>
              <div className="font-bold text-base text-white">Film Sets &amp; Creators</div>
              <p className="text-xs sm:text-sm text-secondary max-w-xs leading-relaxed">
                From Netflix original second units to independent YouTube documentary makers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col items-center text-center gap-3 border border-white/5">
              <Award className="w-10 h-10 text-primary" />
              <div className="text-4xl font-extrabold text-white tracking-tight">42</div>
              <div className="font-bold text-base text-white">Global Patents Filed</div>
              <p className="text-xs sm:text-sm text-secondary max-w-xs leading-relaxed">
                Proprietary condenser elements, GOBO optical rotators, and magnetic thermal fans.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-surface-container-low shadow-xl flex flex-col items-center text-center gap-3 border border-white/5">
              <Star className="w-10 h-10 text-primary-container fill-primary-container" />
              <div className="text-4xl font-extrabold text-white tracking-tight">98.6%</div>
              <div className="font-bold text-base text-white">Five-Star Creator Rating</div>
              <p className="text-xs sm:text-sm text-secondary max-w-xs leading-relaxed">
                Audited verified studio customer reviews backed by our 1-year replacement warranty.
              </p>
            </div>

          </div>

          {/* Testimonial Pod */}
          <div className="p-8 rounded-2xl bg-surface-container flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full bg-cover bg-center shrink-0 border border-white/10"
                style={{ backgroundImage: "url('/images/about/director-marcus-thorne.jpg')" }}
              />
              <div>
                <div className="font-bold text-base text-white">
                  &ldquo;The G-Flash changed our entire lighting package.&rdquo;
                </div>
                <div className="text-xs text-secondary font-mono mt-0.5">
                  Marcus Thorne — Director of Photography, Sundance Fellow
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary-container">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary-container text-primary-container" />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. FINAL CONVERSION CTA BANNER ───────────────────────────────── */}
      <section className="w-full py-20 lg:py-28 bg-surface">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="relative rounded-3xl overflow-hidden bg-surface-container-high p-8 sm:p-14 lg:p-20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-high to-surface-container-high opacity-90 z-0 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-container/20 blur-[110px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-4 max-w-2xl text-left">
              <span className="px-3.5 py-1 rounded-full bg-surface-container text-primary font-mono text-xs uppercase tracking-widest w-fit border border-white/5 font-semibold">
                AVAILABLE NOW // BATCH 04 IN STOCK
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Step onto your next set with pure optical sovereignty.
              </h2>
              <p className="text-base text-secondary leading-relaxed">
                Explore the flagship G-Flash series. Includes custom aspheric condenser lenses, 20 cinematic GOBO masks, and high-discharge USB-C pass-through power.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href="/#models"
                className="px-8 py-4 rounded-xl bg-primary-container text-white font-semibold text-sm hover:bg-tertiary-container transition-all shadow-[0_0_24px_rgba(229,26,52,0.45)] text-center flex items-center justify-center gap-2 group"
              >
                <span>Explore G-Flash PRO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#comparison"
                className="px-8 py-4 rounded-xl bg-surface-container-low text-white hover:bg-surface-container font-semibold text-sm transition-colors text-center border border-white/5"
              >
                View Technical Specs
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
