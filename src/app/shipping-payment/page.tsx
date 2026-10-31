import React from "react";
import { 
  Truck, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Mail, 
  Phone
} from "lucide-react";

export const metadata = {
  title: "Shipping & Payment - Dry Fish Basket",
  description: "Shipping options, delivery timelines, and secure payment methods at Dry Fish Basket.",
};

export default function ShippingPayment() {
  const sections = [
    {
      title: "Shipping & Delivery Policy",
      icon: Truck,
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base leading-relaxed text-[#8c6239]/80">
            Orders are processed and prepared for shipping after successful payment confirmation.
          </p>
          <div className="bg-[#8c6239]/5 p-5 rounded-2xl border border-brand/5">
            <h3 className="font-bold text-[#8c6239] mb-3 text-sm uppercase tracking-wider">Delivery timelines may vary based on:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                "Customer location",
                "Courier partner delays",
                "Public holidays",
                "Weather conditions",
                "Unforeseen operational issues"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                  <span className="text-[#8c6239]/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-[#8c6239]/80">
            Once the order is shipped, tracking details will be shared with the customer. While we strive to deliver within the estimated timeframe, delivery dates are not guaranteed.
          </p>
        </div>
      ),
    },
    {
      title: "Payment Policy",
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-sm md:text-base leading-relaxed text-[#8c6239]/80">
            We accept <strong className="text-[#8c6239]">prepaid payments only</strong> through secure payment gateways.
          </p>
          <div className="bg-[#8c6239]/5 p-5 rounded-2xl border border-brand/5 space-y-3">
            <h3 className="font-bold text-[#8c6239] text-sm uppercase tracking-wider">Accepted Payment Methods:</h3>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm font-semibold">
              {["UPI", "Credit Cards", "Debit Cards", "Net Banking", "Digital Wallets"].map((method, idx) => (
                <span key={idx} className="bg-[#FFFDF6] border border-[#8c6239]/10 text-[#8c6239] px-3.5 py-1.5 rounded-xl shadow-xs">
                  {method}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#8c6239]/60 mt-1">
              All online payments are securely processed by trusted third-party payment providers. We do not store your card or banking details.
            </p>
          </div>
          <div className="bg-red-50 text-red-800 p-4 rounded-2xl border-l-4 border-red-500 font-bold text-sm md:text-base">
            Cash on Delivery (COD) is NOT available.
          </div>
        </div>
      ),
    },
    {
      title: "Order Processing & Quality Preparation",
      icon: Clock,
      content: (
        <div className="space-y-3 text-sm md:text-base leading-relaxed text-[#8c6239]/80">
          <p>
            Because we specialize in premium-grade sun-dried fish sourced directly from verified coastal partners, each batch goes through a strict preparation and packaging cycle:
          </p>
          <ul className="space-y-2 pl-1">
            {[
              "Quality inspection & grading of the dried fish",
              "Careful cleaning and final sun-drying check",
              "Secure, hygienic vacuum-sealed packaging",
              "Final weight check & batch coding before dispatch"
            ].map((step, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#8c6239]/5 text-white flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</span>
                <span className="text-[#8c6239]/90 font-medium">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "Cancellation & Refund Window",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-sm md:text-base leading-relaxed text-[#8c6239]/80">
          <p>
            Cancellations are accepted <strong className="text-[#8c6239]">only before</strong> the packing or dispatch process begins.
          </p>
          <p className="text-sm bg-[#C5A059]/10 p-4 rounded-xl border-l-4 border-[#C5A059] font-medium italic text-[#8c6239]/90">
            Once packaging or dispatch has commenced, orders cannot be cancelled, modified, or refunded due to the perishable nature of these food items.
          </p>
          <p>
            For any approved refunds, payments will be processed back to your original payment method within 5–10 business days.
          </p>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FCFBF8] via-[#FDFBF7] to-[#F7F3EB] text-[#8c6239] py-16 px-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -left-40 top-40 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-40 bottom-40 w-96 h-96 bg-[#8c6239]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[#C5A059] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Store Policies</span>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-[#8c6239] leading-tight mb-4 flex items-center justify-center gap-3">
            Shipping & Payment <Sparkles size={24} className="text-[#C5A059] shrink-0" />
          </h1>
          <div className="w-20 h-1 bg-[#C5A059] mx-auto rounded-full mb-8"></div>
          
          <p className="text-lg text-[#8c6239]/70 font-medium leading-relaxed max-w-2xl mx-auto">
            Find everything you need to know about our quality preparation timelines, domestic shipping details, and secure online payment methods.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div 
                key={idx} 
                className="bg-[#FFFDF6] p-6 md:p-10 rounded-[2rem] border border-[#8c6239]/5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#8c6239]/5 flex items-center justify-center text-white">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-playfair font-bold text-[#8c6239]">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-0 md:pl-16">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer contact note */}
        <div className="mt-16 text-center bg-[#FFFDF6] p-8 rounded-[2rem] border border-[#8c6239]/5 shadow-sm max-w-xl mx-auto">
          <p className="text-sm text-[#8c6239]/60 font-semibold mb-2">Need help with ordering or weight options?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-base font-bold text-[#8c6239]">
            <a href="mailto:info@vkdryfishbasket.com" className="inline-flex items-center gap-2 text-[#C5A059] hover:underline">
              <Mail size={18} />
              info@vkdryfishbasket.com
            </a>
            <span className="hidden sm:inline text-[#8c6239]/20">|</span>
            <div className="inline-flex items-center gap-2 text-[#8c6239]">
              <Phone size={18} className="text-[#C5A059]" />
              <span>+91 96115 26047</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
