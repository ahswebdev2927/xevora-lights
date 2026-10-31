"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  salePrice: number;
  basePrice: number;
  images: string; // JSON string
  colors: string | null;
  category?: string;
  isFeatured: boolean | number | null;
  isCustomizable: boolean | number | null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      try {
        const fetchUrl = query ? `/api/search?q=${encodeURIComponent(query)}` : `/api/search`;
        const res = await fetch(fetchUrl);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  return (
    <div className="w-full min-h-[70vh] bg-[#FAF6ED] text-[#3b2314] font-sans pb-16">
      {/* Top Search Bar Header */}
      <div className="border-b border-[#8c6239]/10 bg-[#8c6239]/5 py-10 px-4">
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#8c6239]">
            {query ? `Search Results for "${query}"` : "Search Our Store"}
          </h1>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-sm">
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-[#3b2314]/15 rounded-2xl pl-5 pr-12 py-3 text-xs md:text-sm font-medium focus:outline-none focus:border-[#8c6239] transition-all text-[#3b2314]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-12 text-black/40 hover:text-black cursor-pointer p-1 rounded-full hover:bg-black/5"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 text-[#8c6239] hover:text-[#734f2d] cursor-pointer p-1.5 rounded-full hover:bg-[#8c6239]/5"
            >
              <SearchIcon size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Search Grid Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#8c6239] mb-4" size={40} />
            <p className="text-black/40 font-bold uppercase tracking-widest text-[10px]">Searching products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#8c6239]/10 shadow-sm max-w-md mx-auto p-8 space-y-4">
            <p className="text-black/40 font-bold uppercase tracking-widest text-xs">No products found</p>
            <p className="text-xs text-black/60 leading-relaxed max-w-xs mx-auto">
              We couldn't find any products matching your search terms. Try double checking spelling or search for something else.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-xs font-semibold text-black/60 mb-2">
              Showing {products.length} {products.length === 1 ? "result" : "results"}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {products.map((p) => {
                const parsedImagesList = getProductImageUrls(p.images, p.colors);
                const firstImage = getFirstProductImageUrl(p.images, p.colors);

                const productProps = {
                  id: String(p.id),
                  name: p.name,
                  description: p.description || "",
                  price: p.salePrice || p.basePrice,
                  basePrice: p.basePrice,
                  salePrice: p.salePrice ?? undefined,
                  imageUrl: firstImage,
                  images: parsedImagesList,
                  categorySlug: "search",
                  isCustomizable: p.isCustomizable ? true : false,
                };
                return <ProductCard key={p.id} product={productProps} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-48 w-full bg-[#FAF6ED]">
        <Loader2 className="animate-spin text-[#8c6239] mb-4" size={40} />
        <p className="text-black/40 font-black uppercase tracking-[0.2em] text-[10px]">Loading search...</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
