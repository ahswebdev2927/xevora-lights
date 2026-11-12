"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Zap,
  Package,
  Phone,
  User,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { auth } from "@/db/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [step, setStep] = useState<"google" | "phone_prompt">("google");
  const [phone, setPhone] = useState("");
  const [userProfile, setUserProfile] = useState<{ fullName: string; email: string }>({
    fullName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (error) setError("");
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase Authentication is not configured. Please check client keys.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Synchronize session with backend
      const res = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          targetRole: "user",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication synchronization failed.");
      }

      // Check if user already has a registered 10-digit phone number
      const existingPhone = data.user?.phoneNumber ? String(data.user.phoneNumber).trim() : "";
      if (!existingPhone || existingPhone.length !== 10) {
        setUserProfile({
          fullName: data.user?.fullName || result.user.displayName || "Creator",
          email: data.user?.email || result.user.email || "",
        });
        setStep("phone_prompt");
        return;
      }

      // If phone already registered, redirect immediately
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network connection error. Please verify your internet connection.");
      } else {
        setError(err.message || "An authentication error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          phone: phone,
          whatsappNumber: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save contact mobile number.");
      }

      // Profile updated successfully -> Redirect
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("Save Phone Error:", err);
      setError(err?.message || "Failed to update phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-28 relative overflow-hidden">
      {/* Ambient Lighting Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[420px] bg-primary-container/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute -bottom-24 -left-20 w-[420px] h-[420px] bg-surface-variant/40 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] bg-tertiary-container/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Node Telemetry Bar */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">
              {step === "phone_prompt" ? "Profile Onboarding" : "Google Cloud Auth // Active"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs font-semibold">TLS 1.3 SECURE</span>
          </div>
        </div>

        {/* Main Obsidian Authentication Card */}
        <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-2xl p-8 sm:p-10 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.85)] border border-white/10 relative overflow-hidden">
          {/* Top Crimson Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent" />

          {/* Header Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-surface-container-high mb-3 border border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">
                {step === "phone_prompt" ? "Account Onboarding" : "Creator Studio Access"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {step === "phone_prompt" ? "Contact Coordinates" : "Welcome to XEVORA"}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1.5">
              {step === "phone_prompt"
                ? "Enter your 10-digit mobile number for order delivery & tracking"
                : "Sign in with your Google account for instantaneous, secure access"}
            </p>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-2.5 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: GOOGLE SIGN-IN */}
          {step === "google" && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] border border-zinc-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-zinc-700 animate-spin" />
                    <span className="text-zinc-800 font-semibold">Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5" />
                    <span>Continue with Google</span>
                    <ArrowRight className="w-4 h-4 text-zinc-400 ml-auto" />
                  </>
                )}
              </button>

              {/* Feature Points */}
              <div className="mt-4 pt-5 border-t border-white/10 flex flex-col gap-2.5 text-xs text-secondary/90">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instant 1-click access without waiting for SMS codes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google OAuth 2.0 with end-to-end cryptographic verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-primary shrink-0" />
                  <span>Real-time order tracking, invoices, and wishlist sync</span>
                </div>
              </div>

              <div className="text-center pt-3">
                <p className="text-[11px] text-secondary/60">
                  By continuing, you agree to Xevora&apos;s{" "}
                  <Link href="/terms-conditions" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: MANDATORY PHONE NUMBER ONBOARDING */}
          {step === "phone_prompt" && (
            <form onSubmit={handleSavePhone} className="flex flex-col gap-5 animate-fadeIn">
              {/* Authenticated Google Account Pill */}
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{userProfile.fullName}</p>
                    <p className="text-[11px] text-secondary truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-secondary" />
                      {userProfile.email}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div>
                <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                  Primary Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-secondary font-mono text-sm pointer-events-none">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-bold text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoFocus
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    required
                    maxLength={10}
                    className="w-full bg-surface-container-lowest text-white font-mono text-base pl-20 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-secondary/30"
                  />
                </div>
                <p className="font-mono text-[11px] text-secondary/60 mt-1.5">
                  Used for order dispatch, courier tracking updates, and delivery OTPs.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:shadow-[0_0_32px_rgba(229,26,52,0.65)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Coordinates...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Enter Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-white transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Optical Showcase</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
