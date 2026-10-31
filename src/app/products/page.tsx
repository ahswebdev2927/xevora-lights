import Link from "next/link";
import { db } from "@/db";
import { products, productVariations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getFirstProductImageUrl } from "@/utils/product";
import { Zap, ShieldCheck, Sliders, ArrowRight } from "lucide-react";

export default async function ProductsCatalogPage() {
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.id));

  return (
    <div className="bg-[#090a0f] text-slate-100 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded-full border border-[#00e5ff]/20">
            Engineered Illumination
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
            The Xevora Collection
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Precision optical instruments engineered for cinematographers, tactical operators, and extreme explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProducts.map((p) => {
            let specs: any = null;
            try {
              specs = p.specifications ? JSON.parse(p.specifications) : null;
            } catch {}

            const img = getFirstProductImageUrl(p.images, p.colors);

            return (
              <div
                key={p.id}
                className="group rounded-3xl bg-white/[0.02] border border-white/10 hover:border-[#00e5ff]/40 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#00e5ff]/5 backdrop-blur-md"
              >
                <div>
                  <div className="relative h-64 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center p-6 overflow-hidden mb-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00e5ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={img || "/images/spec-sheet.png"}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30">
                      FLAGSHIP
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-[#00e5ff] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Highlights */}
                  {specs && (
                    <div className="mt-4 space-y-1.5 text-xs text-slate-300 font-mono border-t border-white/5 pt-4">
                      <div>⚡ {specs.lightSource || "Quad-Source Emitter"}</div>
                      <div>🎨 {specs.colourModes || "4 Spectrum Modes"}</div>
                      <div>🔋 {specs.power || "10,000 mAh Swappable"}</div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">Starting at</div>
                    <div className="text-xl font-extrabold text-white font-mono">
                      ₹{(p.salePrice || p.basePrice).toLocaleString()}
                    </div>
                  </div>

                  <Link
                    href={`/product/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-[#00e5ff] transition-all"
                  >
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Teaser for upcoming models */}
          <div className="rounded-3xl bg-white/[0.01] border border-dashed border-white/10 p-8 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">Coming Soon</span>
            <h3 className="text-lg font-bold text-slate-300">G-Flash Pocket Mini</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">
              Everyday carry (EDC) ultra-compact edition with integrated dual laser collimation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
