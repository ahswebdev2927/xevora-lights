"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid administrator email address.");
      return;
    }

    if (!auth) {
      setError("Firebase Authentication is not initialized. Please verify client keys.");
      return;
    }

    setLoading(true);
    setError("");
    setStatusMessage("Verifying administrator authorization...");

    try {
      // Step 1: Pre-check if the entered email is in ADMIN_EMAILS
      const checkRes = await fetch("/api/auth/check-admin-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok || !checkData.success || !checkData.isAuthorized) {
        setError(checkData.error || "Unauthorized email. This portal is strictly for authorized administrators.");
        setLoading(false);
        setStatusMessage("");
        return;
      }

      // Step 2: Email is authorized -> Launch Google Sign-In with login hint
      setStatusMessage("Launching Google Sign-In verification...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        login_hint: cleanEmail,
        prompt: "select_account",
      });

      const userCredential = await signInWithPopup(auth, provider);
      const signedInEmail = userCredential.user.email?.toLowerCase();

      // Ensure the signed-in Google account matches the authorized email
      if (signedInEmail !== cleanEmail) {
        setError(`Email mismatch. You authorized '${cleanEmail}', but signed in with '${signedInEmail || "unknown"}'.`);
        setLoading(false);
        setStatusMessage("");
        return;
      }

      const idToken = await userCredential.user.getIdToken();

      // Step 3: Synchronize administrative session with backend
      setStatusMessage("Establishing secure admin session...");
      const syncRes = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          targetRole: "admin",
        }),
      });

      const syncData = await syncRes.json();

      if (!syncRes.ok || !syncData.success) {
        setError(syncData.error || "Administrative session establishment failed.");
        setLoading(false);
        setStatusMessage("");
        return;
      }

      // Successful admin login -> Redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Admin Authentication Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please click Request Access again to complete verification.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please enable popups for this site.");
      } else {
        setError(err?.message || "An authentication error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col justify-center items-center p-4 font-inter">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border-t-[12px] border-t-[#e51a34] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e51a34]/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#0f1117] flex items-center justify-center shadow-2xl relative">
            <Lock className="text-[#e51a34]" size={32} />
            <div className="absolute -bottom-2 -right-2 bg-[#e51a34] p-1.5 rounded-lg shadow-lg">
              <ShieldCheck size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Portal
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Authorization &amp; Identity Verification
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="mb-6 p-3 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-2 tracking-[0.15em] ml-1">
              Admin Google Email
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 border-r border-slate-200 pr-3 pointer-events-none">
                <Mail size={16} className="text-[#e51a34]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="admin@xevora.com"
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#e51a34] focus:bg-white rounded-xl py-4 pl-14 pr-4 text-slate-900 font-medium text-sm transition-all outline-none"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 ml-1">
              System verifies authorization against <code className="text-slate-600 font-mono">ADMIN_EMAILS</code> before authentication.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-[#0f1117] hover:bg-[#1a1e29] text-white font-bold py-4 px-6 rounded-2xl shadow-xl disabled:opacity-50 transition-all active:scale-[0.99] flex justify-center items-center space-x-3 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span className="uppercase tracking-[0.15em] text-xs">Authenticating...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span className="uppercase tracking-[0.15em] text-xs">Verify &amp; Sign In with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Optical Showcase</span>
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-[10px] text-white/30 max-w-xs leading-relaxed uppercase tracking-[0.3em] font-bold">
        Xevora Optics Management Infrastructure
      </p>
    </div>
  );
}
