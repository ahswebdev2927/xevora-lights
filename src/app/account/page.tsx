"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Plus,
  Trash2,
  Check,
  Loader2,
  ShieldCheck,
  ChevronRight,
  LogOut,
  MessageSquare,
  Truck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Award
} from "lucide-react";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab: 'profile' | 'address' | 'orders'
  const initialTab = (searchParams.get("tab") as "profile" | "address" | "orders") || "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "address" | "orders">(initialTab);

  // Sync tab with URL parameter
  const switchTab = (tab: "profile" | "address" | "orders") => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Profile State
  const [userId, setUserId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Book State
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [deletingAddressIndex, setDeletingAddressIndex] = useState<number | null>(null);

  // Orders State
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Session and Addresses on mount
  useEffect(() => {
    async function loadAccountData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (sessionData.authenticated && sessionData.user) {
          setUserId(sessionData.user.id);
          setFullName(sessionData.user.fullName || "");
          setEmail(sessionData.user.email || "");
          setPhoneNumber(sessionData.user.phoneNumber || "");
          setWhatsappNumber(sessionData.user.whatsappNumber || sessionData.user.phoneNumber || "");
        } else {
          router.push("/login?redirect=/account");
          return;
        }

        // Fetch Addresses
        const addrRes = await fetch("/api/profile/address");
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          if (addrData.success) {
            setAddresses(addrData.addresses || []);
          }
        }
      } catch (err) {
        console.error("Account load error", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccountData();
  }, [router]);

  // Fetch Orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders") {
      async function loadOrders() {
        setIsLoadingOrders(true);
        try {
          const res = await fetch("/api/profile/orders");
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setOrdersList(data.orders || []);
            }
          }
        } catch (err) {
          console.error("Failed to load orders", err);
        } finally {
          setIsLoadingOrders(false);
        }
      }
      loadOrders();
    }
  }, [activeTab]);

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Please enter your name");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          whatsappNumber: whatsappNumber.trim() || phoneNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Creator coordinates updated successfully!");
      } else {
        showToast(data.error || "Failed to update profile");
      }
    } catch {
      showToast("An error occurred while saving profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add Address
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `${newAddressInput.fullName}, ${newAddressInput.street}, ${newAddressInput.city}, ${newAddressInput.state} - ${newAddressInput.pincode} (Tel: ${newAddressInput.phone})`;
    try {
      const res = await fetch("/api/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formatted }),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
        setIsAddingAddress(false);
        setNewAddressInput({
          fullName: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          phone: "",
        });
        showToast("Delivery address registered!");
      }
    } catch {
      showToast("Failed to save delivery address");
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addrStr: string, idx: number) => {
    if (!confirm("Remove this delivery address from your studio register?")) return;
    setDeletingAddressIndex(idx);
    try {
      const res = await fetch("/api/profile/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addrStr }),
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((_, i) => i !== idx));
        showToast("Address removed");
      }
    } finally {
      setDeletingAddressIndex(null);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderIdToCancel: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancellingOrderId(orderIdToCancel);
    try {
      const res = await fetch(`/api/profile/orders/${orderIdToCancel}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Creator cancelled from dashboard" }),
      });
      const data = await res.json();
      if (data.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderIdToCancel ? { ...o, status: "cancelled" } : o))
        );
        showToast(`Order #${orderIdToCancel} has been cancelled`);
      } else {
        showToast(data.error || "Failed to cancel order");
      }
    } catch {
      showToast("Error cancelling order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pt-28 pb-24">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary-container text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-semibold text-xs sm:text-sm animate-fadeIn border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HERO BANNER: CREATOR IDENTIFIER ─────────────────────────── */}
      <div className="w-full relative overflow-hidden bg-surface-container-lowest py-8 md:py-12 border-b border-white/5">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary-container/10 blur-[120px] pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* User Meta Left */}
            <div className="flex items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-high p-0.5 shadow-xl border border-white/10">
                  <Image
                    src="/images/account/avatar-default.jpg"
                    alt={fullName || "Xevora Creator"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary-container text-white p-1 rounded-full shadow-lg flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                    Welcome back, {fullName || "Creator"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                    Xevora VIP Creator
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-secondary font-mono text-xs">
                  {email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      {email}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    +91 {phoneNumber}
                  </span>
                  <span className="flex items-center gap-1.5 text-secondary/70">
                    UID: XV-{userId ? String(userId).padStart(4, "0") : "8849"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware Tier Badge */}
            <div className="flex items-center gap-3 self-start lg:self-center">
              <div className="bg-surface-container px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5 shadow-sm">
                <div className="p-2 rounded-xl bg-surface-container-high text-primary border border-white/5">
                  <Award className="w-5 h-5 text-primary-container" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-secondary uppercase font-semibold">
                    Studio Hardware Tier
                  </div>
                  <div className="font-bold text-sm text-white">
                    Cinema Pro (Level 3)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── CONSOLE WORKSPACE (3 Tabs Only) ─────────────────────────────── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Console Navigation Sidebar (3 Cols) */}
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-3 flex flex-col gap-1.5 border border-white/5 shadow-md">
              <div className="px-3.5 py-2 font-mono text-[11px] uppercase text-secondary/70 font-semibold tracking-wider">
                Console Navigation
              </div>

              {/* Tab 1: Profile Details */}
              <button
                type="button"
                onClick={() => switchTab("profile")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm text-left ${
                  activeTab === "profile"
                    ? "bg-primary-container text-white shadow-md shadow-primary-container/20"
                    : "text-secondary hover:text-white hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Profile Details</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Tab 2: Address Book */}
              <button
                type="button"
                onClick={() => switchTab("address")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm text-left ${
                  activeTab === "address"
                    ? "bg-primary-container text-white shadow-md shadow-primary-container/20"
                    : "text-secondary hover:text-white hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>Address Book</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container-high text-white">
                  {addresses.length}
                </span>
              </button>

              {/* Tab 3: My Orders */}
              <button
                type="button"
                onClick={() => switchTab("orders")}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm text-left ${
                  activeTab === "orders"
                    ? "bg-primary-container text-white shadow-md shadow-primary-container/20"
                    : "text-secondary hover:text-white hover:bg-surface-container"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>

            {/* Logout Action */}
            <div className="p-3 bg-surface-container-low rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-secondary hover:text-error hover:bg-error-container/10 transition-colors font-mono text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </button>
            </div>
          </aside>

          {/* Right Content Viewport (9 Cols) */}
          <main className="lg:col-span-9 flex flex-col gap-8">
            
            {/* ── TAB 1: PROFILE DETAILS ─────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-white/5 shadow-md flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white">Profile Coordinates</h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Personal and studio contact information used for courier waybills, tax invoices, and RMA correspondence.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 max-w-xl">
                  {/* Name */}
                  <div>
                    <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                      Full Legal / Studio Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-primary pointer-events-none" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Julian Vance"
                        className="w-full bg-surface-container-lowest text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                      Email Address (Invoicing &amp; Firmware Alerts)
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-primary pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="director@production.com"
                        className="w-full bg-surface-container-lowest text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container"
                      />
                    </div>
                  </div>

                  {/* Phone (Read Only) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-xs text-white uppercase tracking-wider font-semibold">
                        Primary Mobile Number
                      </label>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> VERIFIED SMS AUTH
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 absolute left-3.5 text-secondary pointer-events-none" />
                      <input
                        type="text"
                        disabled
                        value={`+91 ${phoneNumber}`}
                        className="w-full bg-surface-container-high/40 text-secondary font-mono text-sm pl-11 pr-4 py-3 rounded-xl border border-white/5 cursor-not-allowed opacity-80"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-xs text-white uppercase tracking-wider font-semibold">
                        WhatsApp Courier Tracking Number
                      </label>
                      <span className="font-mono text-[10px] text-primary">Priority Courier Dispatch</span>
                    </div>
                    <div className="relative flex items-center">
                      <MessageSquare className="w-4 h-4 absolute left-3.5 text-emerald-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full bg-surface-container-lowest text-white font-mono text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container"
                      />
                    </div>
                    <p className="font-mono text-[11px] text-secondary/60 mt-1">
                      Receive instant BlueDart / Delhivery dispatch pings and hardware calibration logs.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-8 py-3.5 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(229,26,52,0.4)] hover:bg-tertiary-container transition-all flex items-center gap-2 disabled:opacity-50 active:scale-98"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Coordinates...</span>
                        </>
                      ) : (
                        <>
                          <span>Save Profile Coordinates</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB 2: ADDRESS BOOK ─────────────────────────────────────── */}
            {activeTab === "address" && (
              <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-white/5 shadow-md flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Address Book</h2>
                    <p className="text-xs text-secondary mt-0.5">
                      Manage registered delivery addresses for rapid hardware order dispatch.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2.5 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-tertiary-container transition-all shadow-sm self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Studio Address</span>
                  </button>
                </div>

                {/* Address Cards List */}
                {addresses.length === 0 ? (
                  <div className="py-12 text-center text-secondary font-mono text-xs border border-dashed border-white/10 rounded-2xl p-8">
                    <MapPin className="w-8 h-8 text-secondary/40 mx-auto mb-2" />
                    <p>No delivery addresses recorded yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="text-primary hover:underline font-bold mt-2 inline-block"
                    >
                      + Add your first address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-surface-container border border-white/5 flex flex-col justify-between gap-4 hover:border-white/15 transition-all"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] font-bold uppercase tracking-wider border border-white/5">
                              {idx === 0 ? "DEFAULT STUDIO" : `STUDIO #${idx + 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr, idx)}
                              disabled={deletingAddressIndex === idx}
                              className="text-secondary hover:text-error transition-colors p-1"
                              title="Delete Address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-white leading-relaxed mt-1">
                            {addr}
                          </p>
                        </div>
                        <div className="font-mono text-[11px] text-secondary/70 flex items-center gap-1.5 border-t border-white/5 pt-2">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>Eligible for 24h Express Air Dispatch</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Address Form Modal */}
                {isAddingAddress && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative max-w-lg w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="absolute top-4 right-4 p-2 text-secondary hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <h3 className="font-bold text-lg text-white mb-1">
                        Register New Delivery Address
                      </h3>
                      <p className="text-xs text-secondary font-mono mb-5">
                        India-wide delivery coordinates
                      </p>

                      <form onSubmit={handleCreateAddress} className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Receiver Name / Studio Name"
                          required
                          value={newAddressInput.fullName}
                          onChange={(e) => setNewAddressInput({ ...newAddressInput, fullName: e.target.value })}
                          className="w-full bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                        />
                        <input
                          type="text"
                          placeholder="Street Address, Building, Floor"
                          required
                          value={newAddressInput.street}
                          onChange={(e) => setNewAddressInput({ ...newAddressInput, street: e.target.value })}
                          className="w-full bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            required
                            value={newAddressInput.city}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, city: e.target.value })}
                            className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            required
                            value={newAddressInput.state}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, state: e.target.value })}
                            className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="PIN Code"
                            required
                            maxLength={6}
                            value={newAddressInput.pincode}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, pincode: e.target.value })}
                            className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                          />
                          <input
                            type="tel"
                            placeholder="Contact Mobile"
                            required
                            maxLength={10}
                            value={newAddressInput.phone}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, phone: e.target.value })}
                            className="bg-surface-container-lowest text-white text-xs px-3.5 py-2.5 rounded-xl border border-white/10"
                          />
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider hover:bg-tertiary-container transition-all"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="px-5 py-3 rounded-xl bg-surface-container text-secondary hover:text-white font-mono text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: MY ORDERS ────────────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-white/5 shadow-md flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white">Order History &amp; Tracking</h2>
                  <p className="text-xs text-secondary leading-relaxed">
                    Live production status, tracking waybills, and invoice archives for all placed optical kits.
                  </p>
                </div>

                {isLoadingOrders ? (
                  <div className="py-16 flex justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : ordersList.length === 0 ? (
                  <div className="py-16 text-center text-secondary font-mono text-xs border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center gap-3">
                    <Package className="w-10 h-10 text-secondary/30" />
                    <p className="text-sm text-white font-bold">No Studio Dispatches Found</p>
                    <p className="max-w-sm text-secondary">
                      You haven&apos;t placed any hardware orders yet. Explore our modular spotlights and creator bundles.
                    </p>
                    <Link
                      href="/#models"
                      className="px-6 py-2.5 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider mt-2 hover:bg-tertiary-container transition-all"
                    >
                      Browse Optical Hardware
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {ordersList.map((order) => {
                      const isProcessing = order.status === "processing" || order.status === "pending";
                      return (
                        <div
                          key={order.id}
                          className="p-5 sm:p-6 rounded-2xl bg-surface-container border border-white/5 flex flex-col gap-4 hover:border-white/15 transition-all"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-sm font-bold text-white">
                                #XV-ORD-{order.id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold tracking-wider ${
                                  order.status === "delivered"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : order.status === "cancelled"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-primary-container/20 text-primary border border-primary/20"
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>
                            <div className="font-mono text-xs text-secondary flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                            </div>
                          </div>

                          {/* Line Items in this order */}
                          <div className="flex flex-col gap-2">
                            {order.items?.map((it: any, itemIdx: number) => (
                              <div key={itemIdx} className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-white">
                                  {it.quantity}x {it.productName || "Xevora G-Flash Unit"}
                                  {it.size && <span className="text-secondary font-mono text-xs"> ({it.size})</span>}
                                </span>
                                <span className="font-mono text-secondary">
                                  ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer & Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-secondary font-mono">Total Value:</span>
                              <span className="font-mono text-base font-bold text-white">
                                ₹{order.totalAmount?.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {order.trackingLink && (
                                <a
                                  href={order.trackingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline font-mono flex items-center gap-1"
                                >
                                  <span>Track Package</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {isProcessing && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingOrderId === order.id}
                                  className="text-xs text-error hover:underline font-mono disabled:opacity-50"
                                >
                                  {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
