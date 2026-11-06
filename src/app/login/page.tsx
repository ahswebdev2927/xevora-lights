"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { auth } from "@/db/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  // Step state: 'phone' | 'otp' | 'profile'
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && step === "otp") {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) { }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (error) setError("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (error) setError("");
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setWhatsappNumber(val);
    if (error) setError("");
  };

  const getFirebaseErrorMessage = (err: any) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-app-credential":
        return "Invalid Firebase App credentials. Please verify your client keys.";
      case "auth/invalid-phone-number":
        return "Please enter a valid 10-digit Indian mobile number.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a few moments before trying again.";
      case "auth/invalid-verification-code":
        return "Incorrect 6-digit verification code. Please check and try again.";
      case "auth/code-expired":
        return "Verification code has expired. Please click resend.";
      case "auth/captcha-check-failed":
        return "Security verification failed. Please refresh the page.";
      default:
        return err?.message || "An authentication error occurred. Please try again.";
    }
  };

  const setupRecaptcha = () => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const container = document.getElementById("recaptcha-container");
    if (container) container.innerHTML = "";

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => { },
      "expired-callback": () => {
        setError("Security check expired. Please retry.");
      },
    });

    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  // STEP 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const appVerifier = setupRecaptcha();
      const formattedPhone = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
      setTimer(30);
      setOtp("");
      // Pre-fill WhatsApp number with same phone number
      setWhatsappNumber(phone);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) { }
        recaptchaVerifierRef.current = null;
      }
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!confirmationResult) {
        throw new Error("No active verification session. Please request a new code.");
      }

      // Verify code with Firebase
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // Sync with backend session
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, idToken }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Authentication sync failed.");
      }

      if (data.isNewUser) {
        setStep("profile");
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete New User Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          fullName: fullName.trim(),
          email: email.trim(),
          whatsappNumber: whatsappNumber.trim() || phone,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to save profile.");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error("Profile save error:", err);
      setError(err?.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-28 relative overflow-hidden">
      {/* Invisible Recaptcha Mount */}
      <div id="recaptcha-container" />

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
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="font-mono text-xs text-secondary uppercase tracking-wider">
              Auth Node // IN-SOUTH-01
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
                Creator Studio Access
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {step === "profile" ? "Creator Onboarding" : "XEVORA"}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1.5">
              {step === "phone" && "Enter your mobile number to receive verification OTP"}
              {step === "otp" && `Enter the 6-digit code sent to +91 ${phone}`}
              {step === "profile" && "Complete your profile for order dispatch & priority service"}
            </p>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-2.5 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: PHONE NUMBER ────────────────────────────────────── */}
          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
              <div>
                <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                  Mobile Number
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
                  10-digit Indian mobile number for instant Firebase SMS authentication.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:shadow-[0_0_32px_rgba(229,26,52,0.65)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-secondary/70">
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
            </form>
          )}

          {/* ── STEP 2: OTP VERIFICATION ───────────────────────────────── */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-white uppercase tracking-wider font-semibold">
                    6-Digit Security Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setError("");
                    }}
                    className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Change Number
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="••••••"
                    maxLength={6}
                    required
                    className="w-full bg-surface-container-lowest text-white font-mono text-2xl tracking-[0.5em] text-center py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-secondary/30 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-secondary font-mono">
                    {timer > 0 ? (
                      `Resend available in 00:${timer < 10 ? `0${timer}` : timer}`
                    ) : (
                      "Didn't receive the SMS?"
                    )}
                  </span>
                  {timer === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="font-mono text-primary font-bold hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:shadow-[0_0_32px_rgba(229,26,52,0.65)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Enter Studio</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 3: NEW USER PROFILE ONBOARDING ───────────────────────── */}
          {step === "profile" && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 animate-fadeIn">
              <div>
                <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                  Full Name / Studio Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-primary pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. Julian Vance"
                    required
                    className="w-full bg-surface-container-lowest text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-secondary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-white uppercase tracking-wider mb-2 font-semibold">
                  Creator Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-primary pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="director@production.com"
                    required
                    className="w-full bg-surface-container-lowest text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-secondary/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-mono text-xs text-white uppercase tracking-wider font-semibold">
                    WhatsApp Number
                  </label>
                  <span className="font-mono text-[10px] text-primary font-semibold">
                    Auto-filled from Mobile
                  </span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-secondary font-mono text-sm pointer-events-none">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={whatsappNumber}
                    onChange={handleWhatsappChange}
                    maxLength={10}
                    placeholder="98765 43210"
                    className="w-full bg-surface-container-lowest text-white font-mono text-sm pl-20 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-secondary/30"
                  />
                </div>
                <p className="font-mono text-[10px] text-secondary/60 mt-1">
                  Used exclusively for live courier tracking notifications &amp; hardware calibration logs.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !fullName.trim() || !email.trim()}
                className="w-full mt-3 py-3.5 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:shadow-[0_0_32px_rgba(229,26,52,0.65)] hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Studio Setup</span>
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
