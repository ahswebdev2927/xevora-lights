import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert size={48} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Access Denied</h1>
        <p className="text-black/60 mb-10 leading-relaxed font-medium">
          You do not have the required administrative permissions to access this area of Xevora Optics.
        </p>

        <div className="space-y-4">
          <Link 
            href="/" 
            className="w-full flex items-center justify-center space-x-3 bg-[#e51a34] hover:bg-[#c9142b] text-white px-8 py-4 rounded-2xl font-bold tracking-wider uppercase text-sm shadow-md shadow-[#e51a34]/20 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Return to Home</span>
          </Link>
          
          <div className="pt-4">
            <p className="text-[10px] text-black/30 uppercase tracking-[0.2em] font-bold">
              Secure Admin Environment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
