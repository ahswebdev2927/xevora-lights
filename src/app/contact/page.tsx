"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    subject: "Product Inquiry",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", orderId: "", subject: "Product Inquiry", comment: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Failed to submit form. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Please reach out via WhatsApp or email directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090a0f] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full border border-[#00e5ff]/20">
            Official Technical Support &amp; Service
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Can We Assist You?
          </h1>
          <p className="text-sm text-slate-400">
            Have questions about beam specifications, optical accessories, or need to claim your 1-year replacement warranty? Our technical team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Channels & Warranty Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">Direct Assistance Channels</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00e5ff] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Email Technical Support</div>
                    <a href="mailto:support@xevoralights.com" className="text-slate-400 hover:text-white transition-colors">
                      support@xevoralights.com
                    </a>
                    <div className="text-[10px] text-slate-500 mt-0.5">Average response: &lt; 2 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00e5ff] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Customer Helpdesk</div>
                    <a href="tel:+919876543210" className="text-slate-400 hover:text-white transition-colors">
                      +91 98765 43210
                    </a>
                    <div className="text-[10px] text-slate-500 mt-0.5">Mon–Sat, 9:00 AM – 7:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00e5ff] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Xevora Engineering HQ</div>
                    <div className="text-slate-400 leading-relaxed">
                      Xevora Tech Park, Cyber Hills,
                      <br />
                      Hyderabad, Telangana - 500081
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Card Callout */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white">Warranty Claims:</strong> Please include your original order number or invoice copy in the form for expedited processing.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Inquiry Form */}
          <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-md">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Received!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out to Xevora Lights. Our technical support team has received your ticket and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary px-6 py-2.5 text-xs font-semibold"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-white mb-2">Send an Inquiry or Ticket</h2>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Order ID (if warranty inquiry)
                    </label>
                    <input
                      type="text"
                      name="orderId"
                      placeholder="e.g. ORD-1082"
                      value={formData.orderId}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Subject / Topic
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00e5ff]"
                  >
                    <option value="Product Inquiry" className="bg-[#12151f]">Product & Specification Inquiry</option>
                    <option value="Warranty Claim" className="bg-[#12151f]">1-Year Warranty Claim / Support</option>
                    <option value="Dispatch Status" className="bg-[#12151f]">Order Delivery & Tracking</option>
                    <option value="Bulk/Studio Order" className="bg-[#12151f]">Commercial / Studio Bulk Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Message / Details *
                  </label>
                  <textarea
                    name="comment"
                    required
                    rows={4}
                    placeholder="Describe your inquiry or question..."
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-accent w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Transmitting Ticket..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
