"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Ticket,
  Truck,
  RotateCcw,
  Shield,
  Loader2,
  CreditCard,
  MapPin,
  ArrowLeft,
  Sparkles,
  Heart
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const addItemToWishlist = useWishlistStore((state) => state.addItem);

  const [isHydrated, setIsHydrated] = useState(false);

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Checkout Modal States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  // Handle URL error notices from PhonePe redirect
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "payment_failed") {
      setCheckoutNotice("Payment was cancelled or failed on gateway. Please try again.");
    } else if (err === "status_verification_failed") {
      setCheckoutNotice("Could not verify payment status. If money was deducted, check your orders.");
    } else if (err) {
      setCheckoutNotice(`Payment notice: ${err}`);
    }
  }, [searchParams]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch available coupons
  useEffect(() => {
    async function fetchCoupons() {
      if (items.length === 0) return;
      try {
        const res = await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
              size: i.size,
              color: i.color,
            })),
          }),
        });
        const data = await res.json();
        if (data.success) {
          setAvailableCoupons(data.data || []);
        }
      } catch (e) {
        console.error("Failed to load coupons", e);
      }
    }
    fetchCoupons();
  }, [items]);

  // Apply Coupon Handler
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponInput.trim().toUpperCase(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            size: i.size,
            color: i.color,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponSuccess(`Coupon "${data.coupon.code}" applied! Saved ₹${data.discountAmount.toLocaleString("en-IN")}`);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Unable to apply coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponSuccess("");
    setCouponError("");
  };

  const handleSaveToWishlist = (item: any) => {
    addItemToWishlist(item.productId);
    removeItem(item.id);
  };

  // Pricing calculations
  const subtotal = getTotalPrice();
  const domesticShippingFee = items.length > 0 ? 199 : 0;
  const orderTotal = Math.max(0, subtotal + domesticShippingFee - discountAmount);

  // Checkout modal initiation
  const handleOpenCheckout = async () => {
    setIsCheckoutModalOpen(true);
    setFetchingAddress(true);
    try {
      const res = await fetch("/api/profile/address");
      const data = await res.json();
      if (data.success && data.addresses && data.addresses.length > 0) {
        setSavedAddresses(data.addresses);
        setSelectedAddressIndex(0);
        setShowNewAddressForm(false);
      } else {
        setSavedAddresses([]);
        setShowNewAddressForm(true);
      }
    } catch (e) {
      console.error("Failed to load saved addresses", e);
      setShowNewAddressForm(true);
    } finally {
      setFetchingAddress(false);
    }
  };

  // Payment trigger
  const handleProceedPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const shippingAddress = showNewAddressForm
        ? `Name: ${newAddress.fullName}, Street: ${newAddress.street}, City: ${newAddress.city}, State: ${newAddress.state}, Pincode: ${newAddress.pincode}, Contact: ${newAddress.phone}`
        : savedAddresses[selectedAddressIndex || 0];

      if (!shippingAddress) {
        alert("Please provide a valid shipping address.");
        setIsProcessingPayment(false);
        return;
      }

      const res = await fetch("/api/checkout/phonepe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          couponCode: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Payment initialization error: " + (data.error || "Failed to start payment"));
        setIsProcessingPayment(false);
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error("Checkout payment error:", err);
      alert("Payment initialization error. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── EMPTY CART VIEW ────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-28 text-center bg-background text-on-surface">
        <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center mb-6 border border-white/10 shadow-xl">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Your Studio Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-secondary max-w-md leading-relaxed mb-8">
          No optical spotlight hardware or GOBO modifier kits have been allocated to your workspace yet.
        </p>
        <Link
          href="/#models"
          className="px-8 py-3.5 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:bg-tertiary-container transition-all flex items-center gap-2 active:scale-98"
        >
          <span>Explore G-Flash Series</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pt-28 pb-24">
      <div className="relative w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-container/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Payment Notice Banner */}
        {checkoutNotice && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-center justify-between text-xs sm:text-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{checkoutNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutNotice(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── BREADCRUMB & HEADER BAR ────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-8">
          <nav className="flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Optics Store
            </Link>
            <span>/</span>
            <span className="text-secondary/70">Cart Workspace</span>
            <span>/</span>
            <span className="text-white font-semibold">
              Review ({getTotalItems()} Units)
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded bg-surface-container-highest text-primary font-mono text-xs uppercase font-bold border border-white/5">
                  Batch #XV-8924
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs text-secondary">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                  Reserved Studio Inventory
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Your Shopping Cart
              </h1>
            </div>
            <div className="text-left md:text-right font-mono text-xs text-secondary">
              DOMESTIC DISPATCH: <span className="text-white font-semibold">INDIA WIDE</span>
            </div>
          </div>

          {/* Domestic Courier Fee Ribbon */}
          <div className="w-full bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-sm border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-white/5">
                <Truck className="w-5 h-5 text-primary-container" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  Pan-India Insured Express Courier
                </p>
                <p className="text-xs text-secondary">
                  Dispatched via BlueDart / Delhivery Priority Air within 24 hours.
                </p>
              </div>
            </div>
            <div className="font-mono text-xs text-primary font-bold bg-surface-container-high px-3 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
              Flat Courier Fee: ₹199
            </div>
          </div>
        </div>

        {/* ── MAIN CART GRID (8 Cols Left / 4 Cols Right) ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Line Items Matrix (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-4 sm:p-6 shadow-md border border-white/5 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 font-mono text-xs text-secondary uppercase tracking-wider font-semibold">
                <span>Allocated Hardware Units</span>
                <span>{items.length} Product Models</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between p-4 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors border border-white/5 group"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-container-highest shrink-0 overflow-hidden relative border border-white/5">
                      <Image
                        src={item.image || "/images/product/hero-main.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5 font-mono">
                        {item.size || "Standard Kit"}
                        {item.color && ` • ${item.color}`}
                      </p>
                      <div className="font-mono text-sm font-bold text-white mt-2">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          type="button"
                          onClick={() => handleSaveToWishlist(item)}
                          className="text-secondary hover:text-primary font-mono text-xs flex items-center gap-1 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" /> Save to Kit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-secondary hover:text-error font-mono text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Line Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="flex items-center bg-surface-container-highest rounded-xl p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-white hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-white hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-mono text-base sm:text-lg font-bold text-primary">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart & Return Links */}
            <div className="flex items-center justify-between text-xs font-mono">
              <Link
                href="/#models"
                className="text-secondary hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Add More Optical Hardware</span>
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-secondary hover:text-error transition-colors"
              >
                Empty Cart Matrix
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Coupon Code Console */}
            <div className="bg-surface-container-low rounded-2xl p-5 shadow-sm border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wider font-bold">
                <Ticket className="w-4 h-4 text-primary" />
                <span>Creator Studio Voucher</span>
              </div>

              {!appliedCoupon ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="PROMO CODE"
                    className="flex-1 bg-surface-container-lowest text-white font-mono text-xs px-3.5 py-3 rounded-xl border border-white/10 uppercase tracking-wider focus:outline-none focus:border-primary-container"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="px-5 py-3 rounded-xl bg-surface-container-high text-white hover:bg-primary-container transition-all font-mono text-xs font-bold uppercase tracking-wider border border-white/10 disabled:opacity-40"
                  >
                    {isValidatingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-high border border-primary-container/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        {appliedCoupon.code}
                      </span>
                      <span className="font-mono text-[11px] text-emerald-400 block">
                        Saved ₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-secondary hover:text-error transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <div className="text-xs text-error font-mono">{couponError}</div>
              )}
              {couponSuccess && !appliedCoupon && (
                <div className="text-xs text-emerald-400 font-mono">{couponSuccess}</div>
              )}

              {/* Quick Coupon Suggestions */}
              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableCoupons.slice(0, 3).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCouponInput(c.code)}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-primary hover:bg-primary-container hover:text-white transition-colors border border-white/5"
                    >
                      +{c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order Ledger Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col gap-5">
              <h3 className="font-bold text-base text-white">Order Summary</h3>

              <div className="flex flex-col gap-3 font-mono text-xs text-secondary border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                  <span>Hardware Subtotal</span>
                  <span className="text-white font-bold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Domestic Express Courier</span>
                  <span className="text-white font-bold">
                    ₹{domesticShippingFee.toLocaleString("en-IN")}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Voucher Discount</span>
                    <span className="font-bold">
                      -₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-secondary/60">
                  <span>Applicable GST (18%)</span>
                  <span>Included in MRP</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base text-white">Total Order Value</span>
                <span className="font-mono text-2xl font-extrabold text-white">
                  ₹{orderTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full py-4 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:shadow-[0_0_32px_rgba(229,26,52,0.65)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Secure Dispatch</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Assurance Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="font-mono text-[10px] text-secondary">2-Yr Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span className="font-mono text-[10px] text-secondary">30-Day Trial</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-mono text-[10px] text-secondary">256-Bit SSL</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── CHECKOUT ADDRESS & PAYMENT MODAL ──────────────────────────────── */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-secondary hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-surface-container-high text-primary border border-white/5">
                <MapPin className="w-5 h-5 text-primary-container" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delivery Coordinates</h3>
                <p className="text-xs text-secondary font-mono">
                  Select destination address for BlueDart dispatch
                </p>
              </div>
            </div>

            {fetchingAddress ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
                      Saved Delivery Addresses
                    </span>
                    {savedAddresses.map((addr, idx) => (
                      <label
                        key={idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                          selectedAddressIndex === idx
                            ? "bg-surface-container-high border-primary-container"
                            : "bg-surface-container border-white/5 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="accent-primary-container mt-1"
                        />
                        <span className="text-xs text-secondary leading-relaxed">
                          {addr}
                        </span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="text-primary hover:underline font-mono text-xs font-semibold text-left mt-1"
                    >
                      + Add New Delivery Address
                    </button>
                  </div>
                )}

                {showNewAddressForm && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
                        Enter Delivery Address
                      </span>
                      {savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="text-xs text-primary font-mono hover:underline"
                        >
                          Use Saved Address
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Receiver Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                    />
                    <input
                      type="text"
                      placeholder="Street Address / Studio Studio Floor"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="PIN Code"
                        maxLength={6}
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                      />
                      <input
                        type="tel"
                        placeholder="Contact Phone"
                        maxLength={10}
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                      />
                    </div>
                  </div>
                )}

                {/* Total and Gateway Trigger */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-xs text-secondary">Payable Value:</span>
                    <span className="text-xl font-extrabold text-white">
                      ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting PhonePe Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay with UPI / Cards / NetBanking</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
