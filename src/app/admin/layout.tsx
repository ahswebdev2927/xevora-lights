"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shirt,
  Package,
  Users,
  LogOut,
  ChevronRight,
  Box,
  BarChart3,
  AlertTriangle,
  X,
  Settings,
  LayoutGrid,
  Calendar,
  Ticket,
  Menu,
  MessageSquare,
  HelpCircle,
  FileText,
  Video,
  Zap
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Inventory", href: "/admin/inventory", icon: Box },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Products", href: "/admin/products", icon: Shirt },
  { name: "Category Settings", href: "/admin/categories", icon: LayoutGrid },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Reels Settings", href: "/admin/reels", icon: Video },
  { name: "FAQs Settings", href: "/admin/faqs", icon: HelpCircle },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Don't show sidebar on login/denied pages
  if (pathname === "/admin/login" || pathname === "/admin/denied") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-inter overflow-hidden relative">
      {/* Sidebar Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-60 bg-[#0f1117] border-r border-[#1f2432] text-white flex flex-col shadow-2xl fixed inset-y-0 z-50 transition-transform duration-300 ${
        isMobileSidebarOpen 
          ? "translate-x-0" 
          : isDesktopSidebarOpen 
            ? "md:translate-x-0 -translate-x-full" 
            : "-translate-x-full"
      }`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group" onClick={() => setIsMobileSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e51a34] to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(229,26,52,0.4)] group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-base tracking-wider text-white uppercase leading-none">XEVORA</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#e51a34] font-bold mt-1">Admin Console</p>
            </div>
          </Link>
          <button 
            onClick={() => {
              setIsMobileSidebarOpen(false);
              setIsDesktopSidebarOpen(false);
            }} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer animate-in fade-in duration-300"
            title="Collapse Sidebar"
          >
            <LayoutDashboard size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1 mt-2 custom-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${isActive
                    ? "bg-[#e51a34] text-white shadow-lg shadow-[#e51a34]/25 translate-x-1 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                  <span className="text-sm font-medium tracking-tight">{link.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-80" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow min-w-0 h-full overflow-hidden flex flex-col relative bg-[#f8fafc] text-slate-900 transition-all duration-300 ${
        isDesktopSidebarOpen ? "md:ml-60 ml-0" : "ml-0"
      }`}>
        {/* Desktop Floating Icon (Only when sidebar is collapsed) */}
        {!isDesktopSidebarOpen && (
          <button
            onClick={() => setIsDesktopSidebarOpen(true)}
            className="hidden md:flex absolute top-4 left-6 z-40 p-2 bg-[#0f1117] hover:bg-[#1b1e28] border border-white/10 rounded-xl transition-all text-white cursor-pointer items-center justify-center shadow-lg animate-in fade-in duration-300"
            title="Expand Sidebar"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e51a34] to-rose-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <LayoutDashboard size={16} className="text-slate-300" />
            </div>
          </button>
        )}

        {/* Mobile Floating Icon (Only when sidebar is closed) */}
        {!isMobileSidebarOpen && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex md:hidden absolute top-4 left-6 z-40 p-2.5 bg-[#0f1117] text-white border border-white/10 rounded-xl transition-all shadow-md items-center justify-center animate-in fade-in duration-300 active:scale-95"
            title="Open Menu"
          >
            <LayoutDashboard size={18} />
          </button>
        )}

        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#e51a34]/30 to-transparent flex-shrink-0"></div>
        <div className="flex-grow overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-[#e51a34] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to exit the admin panel? You will need to login again to access these settings.</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#e51a34] hover:bg-[#c9142b] text-white transition-all shadow-lg shadow-[#e51a34]/20"
                >
                  Logout
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
