"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Package,
  Trash2,
  Edit3,
  X,
  Star,
  Loader2,
  Check,
  Tag,
  Sparkles,
  Search,
  Upload,
  Image as ImageIcon,
  Sliders,
  Layers,
  Wrench,
  Flame,
  ExternalLink,
  ChevronRight,
  Info,
  DollarSign,
  Box,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Variation {
  id?: number;
  size: string;
  color?: string;
  stock: number;
  sku: string;
  basePrice: number; // MRP
  salePrice: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  basePrice: number; // Selling price
  mrp: number | null;
  salePrice: number | null;
  stock: number | null;
  sku: string | null;
  productType: "main_product" | "spare_part" | null;
  homepageSlot: "slot_1" | "slot_2" | null;
  parentProductId: number | null;
  images: string | null;
  avgRating: number;
  numReviews: number;
  category: string | null;
  tags: string | null;
  isFeatured: boolean | number | null;
  isActive: boolean | number | null;
  specifications: string | null;
  totalStock: number;
  variations?: Variation[];
}

const PRESET_SPEC_KEYS = [
  "Light Source",
  "Colour Modes",
  "Zoom & Optics",
  "Power & Battery",
  "Runtime",
  "Charging Port",
  "Max Lumens / Output",
  "CRI / TLCI Rating",
  "Beam Distance",
  "Cooling System",
  "Chassis Material",
  "Dimensions & Weight",
  "Compatibility",
  "In The Box"
];

const DEFAULT_SPECS = [
  { id: "1", key: "Light Source", value: "Quad-source emitter LED module" },
  { id: "2", key: "Colour Modes", value: "White · Ice-blue · Yellow · Golden" },
  { id: "3", key: "Zoom & Optics", value: "Telescopic optical zoom (flood ↔ spot)" },
  { id: "4", key: "Power & Battery", value: "3 × 18650 lithium cells (10,000 mAh combined)" },
  { id: "5", key: "Charging Port", value: "USB Type-C Fast-Charging (PD)" },
  { id: "6", key: "Chassis Material", value: "CNC Aerospace Aluminium Alloy · 465 g" },
  { id: "7", key: "Dimensions & Weight", value: "160 × 53 mm · 465g" }
];

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "main_product" | "spare_part">("all");
  const [filterHomepage, setFilterHomepage] = useState(false);
  
  // Edit mode
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState<"main_product" | "spare_part">("main_product");
  const [homepageSlot, setHomepageSlot] = useState<"" | "slot_1" | "slot_2">("");
  const [parentProductId, setParentProductId] = useState<string>("");
  const [category, setCategory] = useState("Studio Lights");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [avgRating, setAvgRating] = useState("4.9");
  const [numReviews, setNumReviews] = useState("120");
  const [isActive, setIsActive] = useState(true);

  // Pricing & Stock
  const [mrp, setMrp] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  // Optional Bundles / Editions
  const [hasVariations, setHasVariations] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([
    { size: "Standard Edition", basePrice: 0, salePrice: 0, stock: 0, sku: "" }
  ]);

  // Images Gallery
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specifications
  const [specRows, setSpecRows] = useState<{ id: string; key: string; value: string }[]>(DEFAULT_SPECS);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      showToast("Error loading products");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse images from DB
  const parseImages = (imgData: any): string[] => {
    if (!imgData) return [];
    try {
      const parsed = typeof imgData === "string" ? JSON.parse(imgData) : imgData;
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "object") {
        const vals = Object.values(parsed);
        const flattened = vals.flat() as string[];
        return flattened;
      }
    } catch {
      if (typeof imgData === "string" && imgData.startsWith("http")) return [imgData];
    }
    return [];
  };

  // Discount Calculation
  const discountPercentage = useMemo(() => {
    const m = parseFloat(mrp);
    const s = parseFloat(salePrice);
    if (m > 0 && s > 0 && m > s) {
      return Math.round(((m - s) / m) * 100);
    }
    return 0;
  }, [mrp, salePrice]);

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSku("");
    setProductType("main_product");
    setHomepageSlot("");
    setParentProductId("");
    setCategory("Studio Lights");
    setTags("");
    setDescription("");
    setMrp("");
    setSalePrice("");
    setStock("");
    setHasVariations(false);
    setVariations([{ size: "Standard Edition", basePrice: 0, salePrice: 0, stock: 0, sku: "" }]);
    setImages([]);
    setImageUrlInput("");
    setSpecRows(DEFAULT_SPECS);
    setAvgRating("4.9");
    setNumReviews("120");
    setIsActive(true);
    setIsFormOpen(false);
  };

  // Handle Edit Product
  const handleEdit = async (product: Product) => {
    setEditingId(product.id);
    setName(product.name || "");
    setSku(product.sku || "");
    setProductType(product.productType || "main_product");
    setHomepageSlot(product.homepageSlot || "");
    setParentProductId(product.parentProductId ? String(product.parentProductId) : "");
    setCategory(product.category || (product.productType === "spare_part" ? "Spare Parts & Accessories" : "Studio Lights"));
    setTags(product.tags || "");
    setDescription(product.description || "");
    setMrp(product.mrp ? String(product.mrp) : (product.basePrice ? String(product.basePrice) : ""));
    setSalePrice(product.salePrice ? String(product.salePrice) : (product.basePrice ? String(product.basePrice) : ""));
    setStock(product.stock !== null && product.stock !== undefined ? String(product.stock) : String(product.totalStock || 0));
    setAvgRating(String(product.avgRating ?? 4.9));
    setNumReviews(String(product.numReviews ?? 1));
    setIsActive(product.isActive !== false);

    // Images
    setImages(parseImages(product.images));

    // Specifications
    if (product.specifications) {
      try {
        const parsed = JSON.parse(product.specifications);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          const rows = Object.entries(parsed).map(([k, v]) => ({
            id: Math.random().toString(),
            key: k,
            value: String(v)
          }));
          setSpecRows(rows);
        }
      } catch {
        setSpecRows(DEFAULT_SPECS);
      }
    } else {
      setSpecRows(DEFAULT_SPECS);
    }

    // Variations
    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`);
      const data = await res.json();
      if (data.success && data.data.variations && data.data.variations.length > 1) {
        setHasVariations(true);
        setVariations(
          data.data.variations.map((v: any) => ({
            size: v.size,
            color: v.color,
            stock: v.stock || 0,
            sku: v.sku || "",
            basePrice: v.mrp || v.basePrice || 0,
            salePrice: v.salePrice || 0
          }))
        );
      } else {
        setHasVariations(false);
      }
    } catch {}

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success && data.url) {
          setImages(prev => [...prev, data.url]);
        } else {
          showToast(`Upload failed: ${data.error || "Unknown error"}`);
        }
      }
      showToast("Image(s) uploaded successfully!");
    } catch (err) {
      showToast("Error uploading file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // Specification Row Handlers
  const handleAddPresetSpec = (key: string) => {
    if (specRows.some(r => r.key.toLowerCase() === key.toLowerCase())) {
      showToast(`"${key}" is already in the list.`);
      return;
    }
    setSpecRows(prev => [...prev, { id: Math.random().toString(), key, value: "" }]);
  };

  const handleAddCustomSpec = () => {
    setSpecRows(prev => [...prev, { id: Math.random().toString(), key: "", value: "" }]);
  };

  const handleUpdateSpecRow = (id: string, updates: Partial<{ key: string; value: string }>) => {
    setSpecRows(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleRemoveSpecRow = (id: string) => {
    setSpecRows(prev => prev.filter(r => r.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Product name is required.");
      return;
    }

    if (!mrp && !salePrice && !hasVariations) {
      showToast("Please enter an MRP or Selling Price.");
      return;
    }

    setIsSubmitting(true);

    // Convert specs array to object
    const specsObject: Record<string, string> = {};
    specRows.forEach(r => {
      if (r.key.trim() && r.value.trim()) {
        specsObject[r.key.trim()] = r.value.trim();
      }
    });

    const payload: any = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      productType,
      homepageSlot: homepageSlot || null,
      parentProductId: parentProductId ? parseInt(parentProductId) : null,
      category: category.trim(),
      tags: tags.trim() || undefined,
      description: description.trim() || undefined,
      mrp: parseFloat(mrp) || parseFloat(salePrice) || 0,
      salePrice: parseFloat(salePrice) || parseFloat(mrp) || 0,
      stock: parseInt(stock) || 0,
      images,
      specifications: specsObject,
      avgRating: parseFloat(avgRating) || 4.9,
      numReviews: parseInt(numReviews) || 1,
      isActive,
      isFeatured: homepageSlot ? true : false,
      hasVariations
    };

    if (hasVariations && variations.length > 0) {
      payload.variations = variations.map(v => ({
        size: v.size || "Standard Edition",
        basePrice: v.basePrice || payload.mrp,
        salePrice: v.salePrice || payload.salePrice,
        stock: v.stock || 0,
        sku: v.sku || ""
      }));
    }

    try {
      const endpoint = "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const bodyData = editingId ? { ...payload, id: editingId } : payload;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (data.success) {
        showToast(editingId ? "Product updated successfully!" : "Product created successfully!");
        resetForm();
        fetchProducts();
      } else {
        showToast(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      showToast("Network error submitting product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: number, prodName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted successfully.");
        fetchProducts();
      } else {
        showToast(`Cannot delete: ${data.error || "Unknown error"}`);
      }
    } catch {
      showToast("Error deleting product.");
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType =
        filterType === "all" ||
        (filterType === "main_product" && (p.productType === "main_product" || !p.productType)) ||
        (filterType === "spare_part" && p.productType === "spare_part");

      const matchesHomepage = !filterHomepage || !!p.homepageSlot || !!p.isFeatured;

      return matchesSearch && matchesType && matchesHomepage;
    });
  }, [products, searchTerm, filterType, filterHomepage]);

  // Main products list for parentProductId select
  const mainProducts = useMemo(() => {
    return products.filter(p => p.productType === "main_product" || !p.productType);
  }, [products]);

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-[#f8fafc] text-slate-900 font-sans min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f1117] text-white border border-[#1f2432] font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e51a34] animate-pulse" />
            <span className="text-xs uppercase font-mono tracking-widest text-[#e51a34] font-bold">
              Xevora Hardware Catalog
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Product & Parts Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your flagship studio light kits, spare parts, dynamic specifications, and homepage spotlights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                resetForm();
                setIsFormOpen(true);
              }
            }}
            className="flex items-center gap-2 bg-[#e51a34] hover:bg-[#c9142b] text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-[#e51a34]/20 active:scale-95 cursor-pointer"
          >
            {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{isFormOpen ? "Close Form" : "Add New Product / Part"}</span>
          </button>
        </div>
      </div>

      {/* ── PRODUCT FORM (MODAL OR EXPANDED) ────────────────────────── */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e51a34]/10 text-[#e51a34] flex items-center justify-center font-bold">
                {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Product / Part" : "Create New Product or Spare Part"}
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in the details below. Required fields are marked with an asterisk (*).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── CARD 1: BASIC INFO & CLASSIFICATION ───────────────────── */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#e51a34] flex items-center gap-2">
                <Box className="w-4 h-4" />
                1. Basic Info & Role
              </h3>

              {/* Product Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Product Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProductType("main_product");
                      if (category === "Spare Parts & Accessories") setCategory("Studio Lights");
                    }}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      productType === "main_product"
                        ? "bg-[#e51a34] text-white border-[#e51a34] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>Studio Light (Main Product)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProductType("spare_part");
                      setCategory("Spare Parts & Accessories");
                      setHomepageSlot("");
                    }}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      productType === "spare_part"
                        ? "bg-[#e51a34] text-white border-[#e51a34] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Spare Part / Accessory</span>
                  </button>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Xevora G-Flash Quad-Emitter 30W or 20-Piece GOBO Plate Set"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#e51a34] focus:ring-1 focus:ring-[#e51a34] rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
              </div>

              {/* Homepage Spotlight (Main Light only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Homepage Spotlight Slot
                  </label>
                  <span className="text-[11px] font-bold text-[#f59e0b]">Max 2 on homepage</span>
                </div>
                <select
                  value={homepageSlot}
                  onChange={e => setHomepageSlot(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="">Do not feature on homepage (Store catalog only)</option>
                  <option value="slot_1">Hero Slot 1 (Left Spotlight Card)</option>
                  <option value="slot_2">Hero Slot 2 (Right Flagship Featured)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Assigning a slot highlights this product directly in the top comparison cards on the homepage.
                </p>
              </div>

              {/* Parent Product Link (for parts) */}
              {productType === "spare_part" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Compatible With / Part of Main Light
                  </label>
                  <select
                    value={parentProductId}
                    onChange={e => setParentProductId(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
                  >
                    <option value="">Universal / Standalone</option>
                    {mainProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Studio Lights, Batteries"
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Model</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g. XEV-GFL-30W"
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the light, build quality, optical capabilities, runtime, or part details..."
                  className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none resize-none"
                />
              </div>
            </div>

            {/* ── CARD 2: PRICING & INVENTORY ─────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#e51a34] flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                2. Pricing & Stock
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP / List Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="7999"
                    value={mrp}
                    onChange={e => setMrp(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling / Offer Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="4999"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm font-bold text-[#e51a34] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Available *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Discount Indicator Banner */}
              {discountPercentage > 0 && (
                <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium">Calculated Discount:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-white font-extrabold font-mono">
                    {discountPercentage}% OFF
                  </span>
                </div>
              )}

              {/* Optional Bundles / Editions Toggle */}
              <div className="pt-4 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasVariations}
                    onChange={e => setHasVariations(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#e51a34]"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Enable Hardware Editions / Bundles</div>
                    <div className="text-[11px] text-slate-500">
                      Check this if you want multiple package editions (e.g. Solo Light, Creator Pro Kit with 20 GOBOs).
                    </div>
                  </div>
                </label>

                {hasVariations && (
                  <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-[#e51a34] font-bold">Bundled Editions</span>
                      <button
                        type="button"
                        onClick={() =>
                          setVariations(prev => [
                            ...prev,
                            { size: "New Edition", basePrice: parseFloat(mrp) || 0, salePrice: parseFloat(salePrice) || 0, stock: 50, sku: "" }
                          ])
                        }
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        + Add Edition
                      </button>
                    </div>

                    {variations.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-200">
                        <input
                          type="text"
                          placeholder="Edition Name (e.g. Creator Kit)"
                          value={v.size}
                          onChange={e => {
                            const val = e.target.value;
                            setVariations(prev => prev.map((item, i) => (i === idx ? { ...item, size: val } : item)));
                          }}
                          className="col-span-5 bg-white border border-slate-200 focus:border-[#e51a34] rounded px-2 py-1 outline-none text-slate-900 font-medium"
                        />
                        <input
                          type="number"
                          placeholder="MRP"
                          value={v.basePrice || ""}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setVariations(prev => prev.map((item, i) => (i === idx ? { ...item, basePrice: val } : item)));
                          }}
                          className="col-span-2 bg-white border border-slate-200 focus:border-[#e51a34] rounded px-2 py-1 outline-none text-slate-900"
                        />
                        <input
                          type="number"
                          placeholder="Sale"
                          value={v.salePrice || ""}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setVariations(prev => prev.map((item, i) => (i === idx ? { ...item, salePrice: val } : item)));
                          }}
                          className="col-span-2 bg-white border border-slate-200 focus:border-[#e51a34] rounded px-2 py-1 outline-none text-[#e51a34] font-bold"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={v.stock || ""}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setVariations(prev => prev.map((item, i) => (i === idx ? { ...item, stock: val } : item)));
                          }}
                          className="col-span-2 bg-white border border-slate-200 focus:border-[#e51a34] rounded px-2 py-1 outline-none text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setVariations(prev => prev.filter((_, i) => i !== idx))}
                          disabled={variations.length === 1}
                          className="col-span-1 text-slate-400 hover:text-red-500 flex justify-center disabled:opacity-20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Rating */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Rating (★)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={avgRating}
                    onChange={e => setAvgRating(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Verified Reviews Count</label>
                  <input
                    type="number"
                    value={numReviews}
                    onChange={e => setNumReviews(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 3: MEDIA & GALLERY (UNIFIED) ─────────────────────── */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e51a34] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  3. Unified Product Gallery
                </h3>
                <p className="text-xs text-slate-500">
                  First image acts as primary cover. Click &quot;Make Primary&quot; to reorder thumbnail.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#e51a34]" /> : <Upload className="w-4 h-4 text-[#e51a34]" />}
                  <span>{isUploading ? "Uploading..." : "Upload from Device"}</span>
                </button>
              </div>
            </div>

            {/* Direct URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Or paste an image URL (e.g. /images/landing/hero-gflash.jpg or https://...)"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                className="flex-1 bg-white border border-slate-200 focus:border-[#e51a34] rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Add URL
              </button>
            </div>

            {/* Thumbnail Grid */}
            {images.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <span>No images added yet. Upload files or paste image URLs above.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden bg-white border border-slate-200 aspect-square shadow-sm"
                  >
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#e51a34] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                        PRIMARY
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="text-[10px] bg-white/20 hover:bg-[#e51a34] text-white font-bold px-2 py-1 rounded w-full text-center transition-colors"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-[10px] bg-red-500/80 hover:bg-red-500 text-white font-bold px-2 py-1 rounded w-full flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── CARD 4: DYNAMIC SPECIFICATIONS ────────────────────────── */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#e51a34] flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  4. Technical Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamic key-value pairs shown on the product page specification sheet.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCustomSpec}
                className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all shadow-sm w-fit"
              >
                <Plus className="w-4 h-4 text-[#e51a34]" />
                <span>Add Custom Row</span>
              </button>
            </div>

            {/* Quick Preset Pills */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2 font-bold">
                Quick-Add Preset Fields:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SPEC_KEYS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPresetSpec(preset)}
                    className="text-xs bg-white hover:bg-[#e51a34]/10 hover:text-[#e51a34] hover:border-[#e51a34]/30 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-all shadow-2xs"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Key-Value Rows */}
            <div className="space-y-3">
              {specRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Specification Key (e.g. Light Source)"
                      value={row.key}
                      onChange={e => handleUpdateSpecRow(row.id, { key: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="col-span-7">
                    <input
                      type="text"
                      placeholder="Specification Value (e.g. 3,200 Lumens Quad-Emitter)"
                      value={row.value}
                      onChange={e => handleUpdateSpecRow(row.id, { value: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(row.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 5: SUBMIT & ACTIVE STATUS ────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded accent-[#e51a34]"
              />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Published & Active</span>
                <span className="text-xs text-slate-500">Visible to customers in the store and checkout.</span>
              </div>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#e51a34] hover:bg-[#c9142b] text-white font-extrabold text-sm transition-all shadow-md shadow-[#e51a34]/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                <span>{editingId ? "Update Product" : "Save & Publish"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── PRODUCTS TABLE & LISTING ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  filterType === "all" ? "bg-[#e51a34] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("main_product")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  filterType === "main_product" ? "bg-[#e51a34] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Studio Lights
              </button>
              <button
                type="button"
                onClick={() => setFilterType("spare_part")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  filterType === "spare_part" ? "bg-[#e51a34] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Spare Parts
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFilterHomepage(prev => !prev)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                filterHomepage
                  ? "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Homepage Only</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#e51a34]" />
              <span className="text-xs">Loading hardware inventory...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No products found matching your filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Role / Type</th>
                  <th className="py-3 px-4">Homepage Slot</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map(p => {
                  const productImages = parseImages(p.images);
                  const thumb = productImages[0] || "/images/placeholder.png";
                  const isMain = p.productType === "main_product" || !p.productType;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Product Thumbnail & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#e51a34] transition-colors">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {p.sku || `ID: #${p.id}`} • {p.category || "General"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role / Type */}
                      <td className="py-4 px-4">
                        {isMain ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e51a34]/10 text-[#e51a34] border border-[#e51a34]/20">
                            <Flame className="w-3 h-3" />
                            Studio Light
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Wrench className="w-3 h-3" />
                            Spare Part
                          </span>
                        )}
                      </td>

                      {/* Homepage Slot */}
                      <td className="py-4 px-4">
                        {p.homepageSlot === "slot_1" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Sparkles className="w-3 h-3" /> Hero Slot 1
                          </span>
                        ) : p.homepageSlot === "slot_2" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Sparkles className="w-3 h-3" /> Hero Slot 2 (Flagship)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-4">
                        <div className="font-mono">
                          <span className="font-bold text-slate-900 text-base">₹{(p.salePrice || p.basePrice || 0).toLocaleString()}</span>
                          {p.mrp && p.mrp > (p.salePrice || p.basePrice || 0) && (
                            <span className="text-xs text-slate-400 line-through ml-2">₹{p.mrp.toLocaleString()}</span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span
                          className={`font-mono font-semibold text-xs px-2.5 py-1 rounded-lg ${
                            (p.totalStock ?? p.stock ?? 0) > 10
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : (p.totalStock ?? p.stock ?? 0) > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-red-50 text-red-700 border border-red-200/60"
                          }`}
                        >
                          {(p.totalStock ?? p.stock ?? 0)} units
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {p.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-lg hover:bg-[#e51a34]/10 hover:text-[#e51a34] text-slate-400 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
