"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2,
  Sparkles
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#e51a34] animate-spin" />
      </div>
    );
  }

  const statCards = [
    { 
      label: "Total Customers", 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      trend: "+12% this month"
    },
    { 
      label: "Total Orders", 
      value: stats?.totalOrders || 0, 
      icon: ShoppingBag, 
      color: "text-[#e51a34]", 
      bg: "bg-[#e51a34]/10",
      trend: "+5% from yesterday"
    },
    { 
      label: "Total Revenue", 
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-[#f59e0b]", 
      bg: "bg-[#f59e0b]/10",
      trend: "Revenue growing"
    },
    { 
      label: "Active Products", 
      value: stats?.totalProducts || 0, 
      icon: Package, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      trend: "Hardware catalog stable"
    },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="mt-1 text-slate-500 font-medium tracking-tight flex items-center">
          <Sparkles size={16} className="text-[#e51a34] mr-2 shrink-0" />
          Welcome back to the Xevora Optics store management hub.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-all duration-300`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200/60">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                  Live
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</span>
                  <ArrowUpRight size={16} className="text-[#e51a34] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {stat.trend}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
          <h3 className="text-lg font-bold text-slate-900 mb-6">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Database</span>
              <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Auth Service</span>
              <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                Healthy
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#0f1117] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#1f2432] relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#e51a34]/15 rounded-full blur-3xl group-hover:bg-[#e51a34]/25 transition-colors"></div>
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button 
              onClick={() => router.push("/admin/products")}
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-left group/btn"
            >
              <p className="text-[10px] font-bold text-[#e51a34] uppercase tracking-wider mb-1 group-hover/btn:translate-x-0.5 transition-transform">Hardware</p>
              <p className="text-sm font-semibold text-white">Add Product</p>
            </button>
            <button 
              onClick={() => router.push("/admin/orders")}
              className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition-all text-left group/btn"
            >
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 group-hover/btn:translate-x-0.5 transition-transform">Orders</p>
              <p className="text-sm font-semibold text-white">Manage Orders</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
