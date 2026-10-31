"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Mail,
  PhoneCall,
  Terminal,
  Receipt,
  CheckCircle2,
  Lock,
  Send,
  UploadCloud,
  ChevronDown,
  FileText,
  Download,
  Cpu,
  ArrowRight,
  BookOpen,
  Check
} from "lucide-react";

export default function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    category: "",
    message: "",
  });
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion state for Studio Guides
  const [openGuide, setOpenGuide] = useState<number | null>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setAttachedFiles(names);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API submission halted for now — trigger demo toast
    showToast("Support dispatch received — Demo Mode");
    setFormData({
      name: "",
      email: "",
      orderNumber: "",
      category: "",
      message: "",
    });
    setAttachedFiles([]);
  };

  const guides = [
    {
      title: "Eliminating Thermal Warnings under Continuous 100% Beam Output",
      appliesTo: "G-Flash PRO 30W",
      updated: "Updated 4 days ago",
      content:
        "When firing continuous high-output in ambient sets above 32°C (90°F), ensure the rear aerodynamic intake is unobstructed by cable wraps. Update to firmware v2.4+ to engage active dynamic frequency pacing, which prevents abrupt cutoffs and gradually maintains a safe 78°C diode threshold.",
    },
    {
      title: "Zeroing Optical Distortion with Custom B-Size GOBO Stencils",
      appliesTo: "All Optical Snoots",
      updated: "Updated 2 weeks ago",
      content:
        "Ensure standard steel or glass stencils are pushed completely past the secondary magnetic retainer clip. If edges show chromatic fringing, turn the tactile focus barrel clockwise 1.5 rotations until the secondary aspheric condenser element locks into the focal plane.",
    },
    {
      title: "USB-C PD 3.1 100W Handshake Troubleshooting on Location Power Banks",
      appliesTo: "G-Flash Battery Packs",
      updated: "Updated 1 month ago",
      content:
        "Some third-party V-mount batteries negotiate 65W fallback over generic cables. Always use an e-marked 5A/100W EPR cable (supplied with the Xevora Pro Kit). If flashing red indicator persists, perform a 5-second hard power-cycle to clear the cached PD handshake.",
    },
    {
      title: "Activating High-Speed Sync (HSS) with Sony, Canon, and Fuji Hot Shoes",
      appliesTo: "G-Flash Transceivers",
      updated: "Updated 3 weeks ago",
      content:
        "Access the multi-controller menu, hold the rear wheel for 2 seconds to toggle from Standard Optical mode to Wireless RF 2.4GHz. Choose your camera manufacturer profile (Profile 01: Sony MI-Shoe, Profile 02: Canon E-TTL, Profile 03: Fujifilm TTL) to achieve up to 1/8000s shutter synchronization.",
    },
  ];

  return (
    <div className="w-full bg-[#0e0e12] text-[#e4e1e7] min-h-screen pt-24 pb-24 selection:bg-primary-container/30 selection:text-white">
      
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="flex items-center gap-3 bg-surface-container-high border border-primary-container text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-primary-container" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-24">
        
        {/* ── SECTION 1: REAL-TIME ESCALATION ──────────────────────────────── */}
        <section className="w-full">
          <div className="text-center max-w-3xl mx-auto mb-14 flex flex-col gap-3">
            <span className="font-mono text-xs text-primary uppercase tracking-widest font-semibold">
              REAL-TIME ESCALATION // DIRECT CHANNELS
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Direct Creator Support Channels
            </h1>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Speak with a cinematic lighting technician directly. No tiered chatbots; connect instantly with engineering specialists who understand dynamic range and flicker rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Channel 1: Live Chat (WhatsApp) */}
            <div className="p-8 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-xl border border-white/5 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center border border-primary-container/30">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-mono text-xs border border-white/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse" />
                    LIVE NOW
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Live Chat Support</h3>
                <div className="font-mono text-xs text-primary mb-3">Average response: 3 minutes</div>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
                  24/7 dedicated Creator Desk via WhatsApp for immediate pre-shoot configurations, sync issues, and emergency accessory dispatching.
                </p>
              </div>

              <a
                href="https://wa.me/919876543210?text=Hello%20Xevora%20Support,%20I%20need%20assistance%20with%20my%20lighting%20gear."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-primary-container text-white font-semibold text-sm hover:bg-tertiary-container transition-all shadow-[0_0_20px_rgba(229,26,52,0.35)] flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Launch Live Chat</span>
              </a>
            </div>

            {/* Channel 2: Email Engineering */}
            <div className="p-8 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-xl border border-white/5 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high text-white flex items-center justify-center border border-white/5">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary font-mono text-xs border border-white/5">
                    SLA &lt; 4H
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Email Engineering</h3>
                <div className="font-mono text-xs text-white mb-3">support@xevoralights.com</div>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
                  Guaranteed technical response within 4 hours. Optimal for detailed schematic requests, custom optical stencils, and tax invoice changes.
                </p>
              </div>

              <a
                href="mailto:support@xevoralights.com"
                className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <Mail className="w-4 h-4" />
                <span>Compose Dispatch</span>
              </a>
            </div>

            {/* Channel 3: Studio Hotline */}
            <div className="p-8 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-xl border border-white/5 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high text-white flex items-center justify-center border border-white/5">
                    <PhoneCall className="w-6 h-6 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary font-mono text-xs border border-white/5">
                    TOLL FREE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Global Studio Hotline</h3>
                <div className="font-mono text-xs text-white mb-3">+91 98765 43210</div>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
                  Active Mon–Sat 9:00 AM – 7:00 PM IST. Priority direct routing for verified studio rental houses and commercial production stages.
                </p>
              </div>

              <a
                href="tel:+919876543210"
                className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Production Desk</span>
              </a>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: TICKET DISPATCH CONSOLE (FORM SECTION) ───────────── */}
        <section className="w-full pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Side: Context & Calibration Media */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest font-semibold">
                <Receipt className="w-4 h-4 text-primary-container" />
                <span>TICKET DISPATCH CONSOLE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Submit a Pro Hardware Case
              </h2>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Experiencing beam chromatic aberration, high-voltage battery cutoff, or courier delays? Provide the telemetry below. Our engineering squad investigates raw diagnostic logs within 4 hours.
              </p>

              {/* Media Showcase Card */}
              <div className="rounded-2xl overflow-hidden bg-surface-container relative shadow-2xl border border-white/10 group">
                <div
                  className="h-56 w-full bg-cover bg-center group-hover:scale-102 transition-transform duration-500"
                  style={{ backgroundImage: "url('/images/support/optical-calibration.jpg')" }}
                />
                <div className="p-6 bg-surface-container flex flex-col gap-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">G-Flash Optical Calibration</span>
                    <span className="font-mono text-xs text-primary font-bold">FIELD SPEC 99.4%</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Every unit returned under warranty is audited on our spectral goniometer bench to ensure photometric uniformity before redelivery.
                  </p>
                </div>
              </div>

              {/* Fast-Track RMA Checklist */}
              <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col gap-4 border border-white/5">
                <div className="font-mono text-xs text-white uppercase tracking-wider font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Fast-Track Checklist for Hardware Swaps</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono text-xs shrink-0 border border-white/5">
                    1
                  </span>
                  <span className="text-xs text-secondary leading-relaxed">
                    Attach a photo or short clip showing error code (e.g. ERR-03) or beam pattern.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono text-xs shrink-0 border border-white/5">
                    2
                  </span>
                  <span className="text-xs text-secondary leading-relaxed">
                    Have your 8-digit Order or Serial Number ready from the battery cradle.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-mono text-xs shrink-0 border border-white/5">
                    3
                  </span>
                  <span className="text-xs text-secondary leading-relaxed">
                    Advance replacement ships with prepaid return shipping labels for zero downtime.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Pro Form */}
            <div className="lg:col-span-7 bg-surface-container-low p-8 sm:p-10 rounded-3xl shadow-2xl relative border border-white/5">
              
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white">Creator Support Dispatch</h3>
                  <div className="font-mono text-xs text-secondary mt-0.5">
                    Encrypted Channel • SSL 256-Bit Telemetry
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-high text-primary border border-white/5">
                  <Terminal className="w-6 h-6 text-primary-container" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider" htmlFor="name">
                      Full Name <span className="text-primary-container">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Jordan Cole"
                      className="bg-surface-container px-4 py-3 rounded-xl text-white text-sm placeholder:text-secondary/40 border border-white/5 focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider" htmlFor="email">
                      Studio Email <span className="text-primary-container">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@cinema-lab.com"
                      className="bg-surface-container px-4 py-3 rounded-xl text-white text-sm placeholder:text-secondary/40 border border-white/5 focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Order Number */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider" htmlFor="orderNumber">
                      Order / Serial # <span className="text-secondary/60 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="orderNumber"
                      name="orderNumber"
                      type="text"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. XEV-9942 or SN-08219"
                      className="bg-surface-container px-4 py-3 rounded-xl text-white text-sm placeholder:text-secondary/40 border border-white/5 focus:outline-none focus:border-primary-container font-mono transition-colors"
                    />
                  </div>

                  {/* Topic Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider" htmlFor="category">
                      Inquiry Category <span className="text-primary-container">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-surface-container px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-primary-container cursor-pointer border border-white/5"
                      >
                        <option value="" disabled>Select primary concern...</option>
                        <option value="hardware-optical">Hardware Setup &amp; GOBO Optics</option>
                        <option value="tracking">Order Tracking &amp; Delivery Logistics</option>
                        <option value="warranty-rma">Warranty Claim &amp; Replacement Unit</option>
                        <option value="firmware-power">Firmware Flashing &amp; USB-C PD Bug</option>
                        <option value="returns">30-Day Studio Trial Return Request</option>
                        <option value="commercial">Commercial Stage / Wholesale Inquiries</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-3.5 w-4 h-4 text-secondary" />
                    </div>
                  </div>
                </div>

                {/* Message Area */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider" htmlFor="message">
                    Detailed Diagnostic Notes <span className="text-primary-container">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your operating environment, lighting controller version, ambient temperature, or specific defect..."
                    className="bg-surface-container p-4 rounded-xl text-white text-sm placeholder:text-secondary/40 border border-white/5 focus:outline-none focus:border-primary-container resize-none transition-colors"
                  />
                </div>

                {/* Attachment Dropzone */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider">
                    Diagnostic Footage &amp; Defect Photos
                  </label>
                  <label
                    htmlFor="file-upload"
                    className="relative p-6 rounded-2xl bg-surface-container flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-high transition-colors border border-dashed border-white/10"
                  >
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary mb-2 border border-white/5">
                      <UploadCloud className="w-6 h-6 text-primary-container" />
                    </div>
                    <div className="font-semibold text-sm text-white mb-1">
                      Drag &amp; drop photos or error footage
                    </div>
                    <div className="text-xs text-secondary">
                      Supports MP4, MOV, RAW, JPEG, PDF up to 64MB each
                    </div>
                    {attachedFiles.length > 0 && (
                      <div className="mt-3 px-3 py-1 bg-surface-container-high rounded-lg font-mono text-xs text-primary border border-white/10">
                        {attachedFiles.length === 1
                          ? `Attached: ${attachedFiles[0]}`
                          : `Attached: ${attachedFiles.length} files`}
                      </div>
                    )}
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-secondary font-mono text-xs">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Protected by Xevora Pro SLA</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-primary-container text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-tertiary-container transition-all shadow-[0_0_24px_rgba(229,26,52,0.4)] flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Dispatch Support Ticket</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </form>

            </div>

          </div>
        </section>

        {/* ── SECTION 3: FIELD MANUALS & KNOWLEDGE ─────────────────────────── */}
        <section className="w-full pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest font-semibold mb-2">
                FIELD MANUALS &amp; KNOWLEDGE
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Troubleshooting &amp; Documentation
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-secondary max-w-sm">
              Direct engineering schematics, firmware patches, and step-by-step procedures.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: 4 Expandable Studio Guides (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="font-mono text-xs text-white uppercase tracking-wider mb-1 flex items-center gap-2 font-bold">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Most Referenced Studio Guides</span>
              </div>

              {guides.map((guide, idx) => {
                const isOpen = openGuide === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-surface-container-low transition-colors border border-white/5 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenGuide(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" />
                        <span className="font-semibold text-sm sm:text-base text-white hover:text-primary transition-colors">
                          {guide.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-secondary transition-transform duration-300 shrink-0 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-secondary leading-relaxed border-t border-white/5 animate-fadeIn flex flex-col gap-3">
                        <p>{guide.content}</p>
                        <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                          <span className="text-primary font-semibold">{guide.appliesTo}</span>
                          <span className="text-secondary/40">•</span>
                          <span className="text-secondary/60">{guide.updated}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Downloadable Manuals & Firmware Utility (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="font-mono text-xs text-white uppercase tracking-wider mb-1 flex items-center gap-2 font-bold">
                <Download className="w-4 h-4 text-primary" />
                <span>Downloadable Field Manuals (PDF)</span>
              </div>

              {/* PDF Card 1: G-Flash 10W */}
              <div className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-lg border border-white/5 gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-surface-container-high text-primary border border-white/5">
                    <FileText className="w-6 h-6 text-primary-container" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">G-Flash 10W Pocket User Manual</h4>
                    <div className="font-mono text-xs text-secondary mt-0.5">
                      REV 3.2 • ENGLISH &amp; DEUTSCH • 8.4 MB
                    </div>
                  </div>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  Complete setup guide covering magnetic diffuser snap-on tolerances, battery conservation protocols, and optical beam spreads.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="font-mono text-xs text-primary flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> VERIFIED FACTORY COPY
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast("Downloading Xevora_G-Flash_10W_Manual_Rev3.2.pdf")}
                    className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-primary-container hover:text-white text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-white/5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* PDF Card 2: G-Flash PRO 30W */}
              <div className="p-6 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-lg border border-white/5 gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-container text-white">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] uppercase font-bold tracking-wider mb-1 border border-white/5">
                      FLAGSHIP
                    </span>
                    <h4 className="font-bold text-base text-white">G-Flash PRO 30W Studio Guide</h4>
                    <div className="font-mono text-xs text-secondary mt-0.5">
                      REV 4.8 • GLOBAL MULTI-LANG • 14.2 MB
                    </div>
                  </div>
                </div>

                <p className="text-xs text-secondary leading-relaxed">
                  Pro cinema handbook including DMX512 pinouts, Bowens adapter tolerances, GOBO frame indexing, and active fan curves.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="font-mono text-xs text-primary flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> INCLUDES DMX SCHEMATICS
                  </span>
                  <button
                    type="button"
                    onClick={() => showToast("Downloading Xevora_G-Flash_PRO_30W_Studio_Manual_Rev4.8.pdf")}
                    className="px-4 py-2 rounded-xl bg-primary-container text-white font-semibold text-xs hover:bg-tertiary-container transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Firmware Suite Link Box */}
              <div className="p-5 rounded-2xl bg-surface-container flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold text-xs text-white">Need USB Firmware Flashing Utility?</div>
                    <div className="font-mono text-[11px] text-secondary">Mac OS X &amp; Windows v2.4.1 (64-bit)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Preparing Xevora Firmware Suite v2.4.1 installer bundle...")}
                  className="text-primary hover:text-white font-mono text-xs flex items-center gap-1 transition-colors font-bold"
                >
                  <span>GET SUITE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </section>

      </div>

    </div>
  );
}
