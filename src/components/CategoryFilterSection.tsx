"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";


interface Product {
  id: any;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  images: string | null;
  imageUrl: string | null;
  colors: string | null;
  category: string | null;
  gender: string | null;
  isCustomizable: boolean | null;
  tags?: string | null;
  style?: string | null;
  keyWords?: string | null;
  neckStyle?: string | null;
  avgRating?: number | string | null;
  numReviews?: number | string | null;
  filterCategory?: string | null;
  specifications?: string | null;
  sizes?: string[];
  totalStock?: number;
  createdAt?: string | null;
}

interface Section {
  id: any;
  title: string;
  menuId: number;
  productIds: string;
  displayOrder: number;
  products: Product[];
}

interface CategoryFilterSectionProps {
  initialSections: Section[];
  initialDisplayProducts: Product[];
  categoryName: string;
  slug: string;
  filterTypes?: string | null;
  categoryImages?: string | null;
}

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  black: "#171717",
  red: "#EF4444",
  blue: "#3B82F6",
  "sky blue": "#0EA5E9",
  navy: "#1E3A8A",
  grey: "#737373",
  gray: "#737373",
  brown: "#78350F",
  maroon: "#5C1D16",
  pink: "#EC4899",
  beige: "#EADED2",
  gold: "#C5A059",
  "forest green": "#8c6239",
  green: "#22C55E",
  yellow: "#EAB308",
};

const isPluralInsensitiveEqual = (a: string, b: string) => {
  const clean = (s: string) => s.toLowerCase().trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return true;
  if (ca + "s" === cb || cb + "s" === ca) return true;
  if (ca.replace(/s$/, "") === cb.replace(/s$/, "")) return true;
  return false;
};

export default function CategoryFilterSection({
  initialSections,
  initialDisplayProducts,
  categoryName,
  slug,
  filterTypes,
  categoryImages,
}: CategoryFilterSectionProps) {
  // 1. Flatten and deduplicate all products for filtering
  const allProducts = useMemo(() => {
    const map = new Map<string, Product>();

    initialDisplayProducts.forEach((p) => {
      map.set(String(p.id), p);
    });

    initialSections.forEach((section) => {
      (section.products || []).forEach((p) => {
        map.set(String(p.id), p);
      });
    });

    return Array.from(map.values());
  }, [initialSections, initialDisplayProducts]);

  // Parse admin configured filter types
  const adminFilterTypes = useMemo(() => {
    if (!filterTypes) return null;
    return filterTypes
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [filterTypes]);

  const bannerImage = useMemo(() => {
    if (!categoryImages) return null;
    if (categoryImages.includes(",")) {
      const parts = categoryImages.split(",");
      return parts[1] || parts[0];
    }
    return categoryImages;
  }, [categoryImages]);

  const displayTitle = useMemo(() => {
    return (categoryName || slug || "").replace(/-/g, " ").trim();
  }, [categoryName, slug]);

  // Helper to check if a product matches a type
  const isTypeMatch = (type: string, name: string, category: string, tags: string, style: string, keyWords: string) => {
    const lowerType = type.toLowerCase().trim();
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();
    const lowerTags = tags.toLowerCase();
    const lowerStyle = style.toLowerCase();
    const lowerKeyWords = keyWords.toLowerCase();

    // Check direct inclusion
    return (
      lowerCategory.includes(lowerType) ||
      lowerTags.includes(lowerType) ||
      lowerName.includes(lowerType) ||
      lowerStyle.includes(lowerType) ||
      lowerKeyWords.includes(lowerType)
    );
  };



  // 2. Classify product types dynamically
  const productsWithTypes = useMemo(() => {
    return allProducts.map((p) => {
      let productTypes: string[] = [];
      const name = (p.name || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const tags = (p.tags || "").toLowerCase();
      let resolvedStyle = p.style || "";
      let resolvedKeyWords = p.keyWords || "";
      if (p.specifications) {
        try {
          const specs = JSON.parse(p.specifications);
          if (specs["Style"]) resolvedStyle = specs["Style"];
          if (specs["Key Words"]) resolvedKeyWords = specs["Key Words"];
          if (specs["Key Details"]) resolvedKeyWords = specs["Key Details"];
        } catch {}
      }
      const style = resolvedStyle.toLowerCase();
      const keyWords = resolvedKeyWords.toLowerCase();

      const rawFilterCat = (p.filterCategory || "").trim();

      if (rawFilterCat) {
        // Split comma-separated filter categories to support adding to multiple filters
        const parts = rawFilterCat.split(",").map(t => t.trim()).filter(Boolean);
        parts.forEach((part) => {
          if (adminFilterTypes && adminFilterTypes.length > 0) {
            const matched = adminFilterTypes.find(t => isPluralInsensitiveEqual(t, part));
            productTypes.push(matched || part);
          } else {
            productTypes.push(part);
          }
        });
      } else if (adminFilterTypes && adminFilterTypes.length > 0) {
        // Fall back to keyword matching using isTypeMatch
        const sortedAdminTypes = [...adminFilterTypes].sort((a, b) => b.length - a.length);
        const matchedTypes = sortedAdminTypes.filter((t) => isTypeMatch(t, name, category, tags, style, keyWords));
        if (matchedTypes.length > 0) {
          productTypes = matchedTypes;
        } else {
          productTypes = ["Other"];
        }
      } else {
        productTypes = [p.category || "Other"];
      }

      return { 
        ...p, 
        classifiedTypes: productTypes,
        classifiedType: productTypes[0] || "Other" 
      };
    });
  }, [allProducts, adminFilterTypes]);

  // 3. Extract unique types and colors dynamically
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    
    // 1. Add all configured admin filter types
    if (adminFilterTypes && adminFilterTypes.length > 0) {
      adminFilterTypes.forEach(t => typesSet.add(t));
    }
    
    // 2. Add custom filter categories from products of this category (based on the product added)
    productsWithTypes.forEach((p) => {
      p.classifiedTypes.forEach((t) => {
        // Match existing adminFilterTypes to prevent case/plural duplicates
        const matched = adminFilterTypes?.find(adminT => isPluralInsensitiveEqual(adminT, t));
        const resolved = matched || t;
        // Deduplicate case-insensitively and plural-insensitively
        const alreadyInSet = Array.from(typesSet).find(existingT => isPluralInsensitiveEqual(existingT, resolved));
        if (!alreadyInSet) {
          typesSet.add(resolved);
        }
      });
    });

    // 3. Include "Other" if there are any products classified as "Other"
    if (adminFilterTypes && adminFilterTypes.length > 0) {
      const hasOther = productsWithTypes.some((p) => p.classifiedTypes.includes("Other"));
      if (hasOther) {
        typesSet.add("Other");
      }
    }
    
    return Array.from(typesSet);
  }, [productsWithTypes, adminFilterTypes]);

  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    productsWithTypes.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c && typeof c === "string" && c.trim()) {
              colorsSet.add(c.trim());
            }
          });
        } else if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      } catch {
        if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      }
    });
    return Array.from(colorsSet).sort();
  }, [productsWithTypes]);

  // 3.5 Dynamic Price Limits Computation
  const [minLimit, maxLimit] = useMemo(() => {
    if (productsWithTypes.length === 0) return [0, 10000];
    let min = Infinity;
    let max = -Infinity;
    productsWithTypes.forEach((p) => {
      const price = p.salePrice || p.basePrice || 0;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    if (min === Infinity || max === -Infinity) return [0, 10000];
    if (min === max) return [Math.max(0, min - 100), min + 100];
    return [Math.floor(min), Math.ceil(max)];
  }, [productsWithTypes]);

  // 4. State Management (Multi-select arrays)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("best-selling");
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");
  const [currentPage, setCurrentPage] = useState(1);

  const SORT_OPTIONS: Record<string, string> = {
    "featured": "Featured",
    "relevant": "Most relevant",
    "best-selling": "Best selling",
    "title-asc": "Alphabetically, A-Z",
    "title-desc": "Alphabetically, Z-A",
    "price-asc": "Price, low to high",
    "price-desc": "Price, high to low",
    "date-asc": "Date, old to new",
    "date-desc": "Date, new to old",
  };

  useEffect(() => {
    setPriceRange([minLimit, maxLimit]);
  }, [minLimit, maxLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTypes, selectedColors, selectedSizes, availabilityFilter, priceRange, sortOption]);

  useEffect(() => {
    if (allProducts.length === 0) {
      document.body.classList.add("hide-footer");
      return () => {
        document.body.classList.remove("hide-footer");
      };
    }
  }, [allProducts.length]);

  const isPriceFilterActive = priceRange[0] !== minLimit || priceRange[1] !== maxLimit;
  const isFilterOrSortActive =
    selectedTypes.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    availabilityFilter.length > 0 ||
    sortOption !== "best-selling" ||
    isPriceFilterActive;

  // Determine if this is a shoes/footwear category
  const isShoesCategory = useMemo(() => {
    const term = (categoryName || slug || "").toLowerCase();
    return term.includes("shoe") || term.includes("footwear") || term.includes("slipper") || term.includes("sandal") || term.includes("flip-flop") || term.includes("flip flop");
  }, [categoryName, slug]);

  const availableSizes = useMemo(() => {
    return isShoesCategory 
      ? ["5", "6", "7", "8", "9", "10", "11", "12"]
      : ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  }, [isShoesCategory]);

  // 5. Calculate counts dynamically based on the current collection (case and plural insensitive)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Initialize counts for all unique available types to 0
    availableTypes.forEach((type) => {
      counts[type] = 0;
    });

    productsWithTypes.forEach((p) => {
      p.classifiedTypes.forEach((t) => {
        const matchedAvailable = availableTypes.find(availT => isPluralInsensitiveEqual(availT, t));
        if (matchedAvailable) {
          counts[matchedAvailable] = (counts[matchedAvailable] || 0) + 1;
        }
      });
    });
    return counts;
  }, [productsWithTypes, availableTypes]);

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            const trimmed = c.trim();
            if (trimmed) {
              counts[trimmed] = (counts[trimmed] || 0) + 1;
            }
          });
        } else if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      } catch {
        if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      }
    });
    return counts;
  }, [productsWithTypes]);

  const sizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      const sizes = p.sizes || [];
      sizes.forEach((s) => {
        const normalized = s.toUpperCase().trim();
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });
    return counts;
  }, [productsWithTypes]);

  // 6. Filtering and Sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...productsWithTypes];

    // Filter by selected types (OR logic)
    if (selectedTypes.length > 0) {
      list = list.filter((p) => 
        p.classifiedTypes.some((t) => 
          selectedTypes.some((selT) => isPluralInsensitiveEqual(selT, t))
        )
      );
    }

    // Filter by selected colors
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        try {
          const parsed = JSON.parse(p.colors || "[]");
          if (Array.isArray(parsed)) {
            return parsed.some((c) => selectedColors.includes(c.trim()));
          }
          return selectedColors.includes(String(p.colors).trim());
        } catch {
          return selectedColors.includes(String(p.colors).trim());
        }
      });
    }

    // Filter by selected sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const pSizes = (p.sizes || []).map((s) => s.toUpperCase().trim());
        return selectedSizes.some((sz) => pSizes.includes(sz.toUpperCase().trim()));
      });
    }

    // Filter by availability (In Stock / Out of Stock)
    if (availabilityFilter.length > 0) {
      list = list.filter((p) => {
        const inStock = p.totalStock !== undefined ? p.totalStock > 0 : true;
        if (availabilityFilter.includes("in-stock") && inStock) return true;
        if (availabilityFilter.includes("out-of-stock") && !inStock) return true;
        return false;
      });
    }

    // Filter by price range
    list = list.filter((p) => {
      const price = p.salePrice || p.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products based on selected option
    if (sortOption === "title-asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "title-desc") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOption === "price-asc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceA - priceB;
      });
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceB - priceA;
      });
    } else if (sortOption === "date-asc") {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });
    } else if (sortOption === "date-desc") {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    return list;
  }, [productsWithTypes, selectedTypes, selectedColors, selectedSizes, availabilityFilter, sortOption, priceRange]);

  const productsPerPage = 20;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  // Pagination calculations for custom sections view
  const totalSectionProductsCount = useMemo(() => {
    return initialSections.reduce((sum, s) => sum + (s.products || []).length, 0);
  }, [initialSections]);

  const totalSectionPages = Math.ceil(totalSectionProductsCount / productsPerPage);

  const paginatedSections = useMemo(() => {
    let globalIndex = 0;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    return initialSections.map((section) => {
      const sectionProducts: any[] = [];
      (section.products || []).forEach((product: any) => {
        if (globalIndex >= startIndex && globalIndex < endIndex) {
          sectionProducts.push(product);
        }
        globalIndex++;
      });

      return {
        ...section,
        products: sectionProducts,
      };
    }).filter(section => section.products.length > 0);
  }, [initialSections, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setAvailabilityFilter([]);
    setSortOption("best-selling");
    setPriceRange([minLimit, maxLimit]);
  };

  if (allProducts.length === 0) {
    return (
      <div className="flex-grow min-w-0 px-4 py-4 md:py-6 max-w-lg mx-auto w-full flex flex-col justify-center">
        {/* Header Title & Description */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-black mb-1 tracking-tight">{categoryName}</h1>
          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto rounded-full mb-2"></div>
          <p className="text-black/70 max-w-sm mx-auto font-inter leading-relaxed text-[11px]">
            Explore our curated selection of premium {categoryName.toLowerCase()} products, 
            prepared under strict hygienic standards to preserve authentic flavor and freshness.
          </p>
        </div>
        
        <div
          className="py-6 md:py-8 text-center bg-brand/5 rounded-[1.5rem] border border-brand/10 px-5 max-w-sm w-full mx-auto shadow-sm"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShoppingBag className="text-[#C5A059]" size={16} />
          </div>
          <h2 className="text-base font-playfair font-bold text-black mb-0.5">Coming Soon</h2>
          <p className="text-black/60 max-w-xs mx-auto text-[10px] mb-4 leading-relaxed font-inter">
            No products have been added to this category yet. We are currently preparing fresh new batches for you.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand text-white text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-brand-hover shadow-md transition-all duration-300 cursor-pointer"
          >
            Browse Other Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans select-none pb-12 bg-[#FAF6ED]">
      {/* Category Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col gap-2">
          {/* Breadcrumbs */}
          <div className="text-[10px] font-black uppercase tracking-wider text-black/40">
            <Link href="/" className="hover:text-brand transition-colors">Home</Link>
            <span className="mx-2 text-black/20">/</span>
            <span className="text-black/30">Collections</span>
            <span className="mx-2 text-black/20">/</span>
            <span className="text-black/60">{displayTitle || "Category"}</span>
          </div>
          {/* Category Title */}
          <h1 className="text-3xl font-serif font-black text-[#3b2314] uppercase tracking-wide mt-1">
            {displayTitle || "Category"}
          </h1>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#8c6239]/10 relative z-40 mt-4">
        {/* Left: Availability & Price Dropdowns */}
        <div className="flex items-center gap-6 text-xs font-semibold">
          {/* Availability */}
          <div className="relative">
            <button
              onClick={() => {
                setIsAvailabilityOpen(!isAvailabilityOpen);
                setIsPriceOpen(false);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-1 text-black/70 hover:text-black transition-colors focus:outline-none cursor-pointer"
            >
              Availability
              <ChevronDown size={14} className={`transition-transform ${isAvailabilityOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isAvailabilityOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAvailabilityOpen(false)} />
                <div className="absolute left-0 mt-2 z-50 bg-[#FAF6ED] border border-[#8c6239]/15 rounded-2xl shadow-xl p-5 min-w-[200px] space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black/40">
                    <span>Selected</span>
                    <button onClick={() => setAvailabilityFilter([])} className="underline hover:text-brand">Reset</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-xs text-black/85 cursor-pointer hover:text-[#8c6239] transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("in-stock")}
                        onChange={() => {
                          setAvailabilityFilter(prev =>
                            prev.includes("in-stock") ? prev.filter(x => x !== "in-stock") : [...prev, "in-stock"]
                          );
                        }}
                        className="rounded border-[#8c6239]/20 accent-[#8c6239] w-4 h-4"
                      />
                      In stock
                    </label>
                    <label className="flex items-center gap-3 text-xs text-black/85 cursor-pointer hover:text-[#8c6239] transition-colors select-none">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("out-of-stock")}
                        onChange={() => {
                          setAvailabilityFilter(prev =>
                            prev.includes("out-of-stock") ? prev.filter(x => x !== "out-of-stock") : [...prev, "out-of-stock"]
                          );
                        }}
                        className="rounded border-[#8c6239]/20 accent-[#8c6239] w-4 h-4"
                      />
                      Out of stock
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Price */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPriceOpen(!isPriceOpen);
                setIsAvailabilityOpen(false);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-1 text-black/70 hover:text-black transition-colors focus:outline-none cursor-pointer"
            >
              Price
              <ChevronDown size={14} className={`transition-transform ${isPriceOpen ? "rotate-180" : ""}`} />
            </button>

            {isPriceOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsPriceOpen(false)} />
                <div className="absolute left-0 mt-2 z-50 bg-[#FAF6ED] border border-[#8c6239]/15 rounded-2xl shadow-xl p-5 min-w-[260px] space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-black/40">
                    <span>Max is Rs. {maxLimit}</span>
                    <button onClick={() => setPriceRange([minLimit, maxLimit])} className="underline hover:text-brand">Reset</button>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="flex items-center bg-white border border-[#3b2314]/15 rounded-xl px-3 py-2 text-xs">
                      <span className="text-black/40 mr-1">Rs.</span>
                      <input
                        type="number"
                        placeholder="From"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = e.target.value === "" ? minLimit : Number(e.target.value);
                          setPriceRange([val, priceRange[1]]);
                        }}
                        className="w-16 focus:outline-none"
                      />
                    </div>
                    <span className="text-black/30">-</span>
                    <div className="flex items-center bg-white border border-[#3b2314]/15 rounded-xl px-3 py-2 text-xs">
                      <span className="text-black/40 mr-1">Rs.</span>
                      <input
                        type="number"
                        placeholder="To"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = e.target.value === "" ? maxLimit : Number(e.target.value);
                          setPriceRange([priceRange[0], val]);
                        }}
                        className="w-16 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Products Count & Sort & Grid Icons */}
        <div className="flex items-center gap-6 ml-auto text-xs font-semibold text-black/70">
          <span>{filteredAndSortedProducts.length} items</span>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsAvailabilityOpen(false);
                setIsPriceOpen(false);
              }}
              className="flex items-center gap-1 text-black/70 hover:text-black transition-colors focus:outline-none cursor-pointer"
            >
              Sort by: {SORT_OPTIONS[sortOption]}
              <ChevronDown size={14} className={`transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div className="absolute right-0 mt-2 z-50 bg-[#FAF6ED] border border-[#8c6239]/15 rounded-2xl shadow-xl py-2 min-w-[200px] overflow-hidden">
                  {Object.entries(SORT_OPTIONS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSortOption(key);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#8c6239]/5 transition-colors text-xs flex items-center gap-2 ${
                        sortOption === key ? "text-[#8c6239] font-bold" : "text-black/70"
                      }`}
                    >
                      <span className="w-3 flex-shrink-0 flex items-center justify-center">
                        {sortOption === key && <Check size={12} />}
                      </span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main product area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-30">
        <AnimatePresence mode="wait">
          {filteredAndSortedProducts.length > 0 ? (
            <motion.div
              key="grid-layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-300">
                {paginatedProducts.map((p) => {
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
                    categorySlug: slug,
                    isCustomizable: p.isCustomizable ?? undefined,
                    style: p.style,
                    neckStyle: p.neckStyle,
                    keyWords: p.keyWords,
                    avgRating: p.avgRating,
                    numReviews: p.numReviews,
                    totalStock: p.totalStock,
                  };
                  return <ProductCard key={p.id} product={productProps} />;
                })}
              </div>

              {/* Global Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2.5 mt-12 pt-8 border-t border-brand/5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      currentPage === 1
                        ? "bg-brand/5 text-black/30 border border-brand/5 cursor-not-allowed opacity-60"
                        : "bg-brand/5 text-black border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
                    }`}
                  >
                    Prev
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-brand text-[#C5A059] shadow-md scale-105"
                            : "bg-brand/5 text-black border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      currentPage === totalPages
                        ? "bg-brand/5 text-black/30 border border-brand/5 cursor-not-allowed opacity-60"
                        : "bg-brand/5 text-black border border-brand/10 hover:bg-brand/10 cursor-pointer active:scale-95"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center bg-brand/5 rounded-[2.5rem] border border-brand/10 px-8"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <SlidersHorizontal className="text-[#C5A059]" size={24} />
              </div>
              <h2 className="text-xl font-playfair font-bold text-black mb-2">No Matching Products</h2>
              <p className="text-black/60 max-w-sm mx-auto text-sm mb-6">
                We couldn't find any products matching your active filters. Try clearing your filters to see all available items.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-brand text-[#FAF6ED] text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-brand-hover shadow-md transition-all duration-300 cursor-pointer"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
