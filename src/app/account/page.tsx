"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  LogOut
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "addresses">("profile");

  // Profile State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddressInput, setNewAddressInput] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          setFullName(sessionData.user.fullName || "");
          setEmail(sessionData.user.email || "");
          setPhoneNumber(sessionData.user.phoneNumber || "");
        } else {
          router.push("/login?redirect=/account");
          return;
        }

        const addrRes = await fetch("/api/profile/address");
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          if (addrData.success) {
            setAddresses(addrData.addresses || []);
          }
        }
      } catch {
        // error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
        setTimeout(() => setProfileMsg(null), 3000);
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim()) return;

    try {
      const res = await fetch("/api/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddressInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        setNewAddressInput("");
        setIsAddingAddress(false);
      }
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const handleDeleteAddress = async (addr: string, idx: number) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    setDeletingIndex(idx);
    try {
      const res = await fetch("/api/profile/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      if (res.ok) {
        setAddresses(addresses.filter((a) => a !== addr));
      }
    } finally {
      setDeletingIndex(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="bg-[#090a0f] text-slate-100 min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff]">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {fullName || "Xevora Customer"}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {phoneNumber} · Verified Member
              </p>
            </div>
          </div>

          <Link
            href="/profile/orders"
            className="btn-accent px-5 py-2.5 text-xs font-bold flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </Link>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-white text-black"
                : "bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            Profile & Email Settings
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "bg-white text-black"
                : "bg-white/[0.03] text-slate-400 hover:text-white"
            }`}
          >
            Saved Delivery Addresses ({addresses.length})
          </button>
        </div>

        {/* Tab 1: Profile & Email */}
        {activeTab === "profile" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 max-w-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Personal Information</h2>
            <p className="text-xs text-slate-400 mb-6">
              Update your registered full name and primary email address for invoice deliveries and warranty notifications.
            </p>

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Official invoices, firmware updates, and dispatch tracking links will be sent here.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Mobile Number (Fixed login credential)
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phoneNumber}
                    disabled
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    profileMsg.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="btn-accent px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Saved Delivery Addresses</h2>
                <p className="text-xs text-slate-400">Manage destinations for your lighting gear dispatches.</p>
              </div>

              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Address
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white">Add New Shipping Address</h3>
                <textarea
                  value={newAddressInput}
                  onChange={(e) => setNewAddressInput(e.target.value)}
                  placeholder="Enter full address: Flat/House No, Building, Street, Landmark, City, State, Pincode"
                  rows={3}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-accent px-5 py-2 text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List Addresses */}
            {addresses.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No saved addresses found. Add one above to speed up checkout.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-200 leading-relaxed break-words">
                        {addr}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">Address #{i + 1}</span>
                      <button
                        onClick={() => handleDeleteAddress(addr, i)}
                        disabled={deletingIndex === i}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
