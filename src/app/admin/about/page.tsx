"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAboutPage() {
  const router = useRouter();
  const [founderCards, setFounderCards] = useState<{ imageUrl: string; text: string }[]>([
    { imageUrl: "", text: "" },
    { imageUrl: "", text: "" },
    { imageUrl: "", text: "" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const resFounder = await fetch("/api/admin/settings?key=founder_promo");
      const dataFounder = await resFounder.json();
      if (dataFounder.success && dataFounder.data) {
        try {
          const parsed = JSON.parse(dataFounder.data.value);
          if (Array.isArray(parsed) && parsed.length === 3) {
            setFounderCards(parsed);
          }
        } catch {}
      }
      if (resFounder.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to load about section settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleSaveFounderPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "founder_promo",
          value: JSON.stringify(founderCards),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Founder/About Section promo cards saved successfully!");
        router.refresh();
      } else {
        setError(data.error || "Failed to save settings.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-playfair font-bold text-black">About Section Settings</h1>
        <p className="mt-2 text-black/60 font-medium tracking-tight">
          Manage the 3 cards promoting the founder's mission on the homepage.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center space-x-3 text-green-600 animate-in fade-in">
          <Check size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-500 animate-in fade-in">
          <AlertCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/5">
        <h2 className="text-xl font-playfair font-bold text-black mb-6 border-b border-brand/5 pb-4">Homepage Mission / About Cards (3 Cards)</h2>
        
        <form onSubmit={handleSaveFounderPromo} className="space-y-8">
          {founderCards.map((card, idx) => (
            <div key={idx} className="bg-brand/5 p-5 rounded-2xl border border-brand/10 space-y-4">
              <h3 className="text-sm font-bold text-[#8c6239] uppercase tracking-wider">Card #{idx + 1}</h3>
              
              {/* Image URL Input */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Card Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={card.imageUrl}
                    onChange={(e) => {
                      const updated = [...founderCards];
                      updated[idx].imageUrl = e.target.value;
                      setFounderCards(updated);
                    }}
                    placeholder="Paste image URL here"
                    className="w-full bg-white border border-brand/20 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none focus:border-[#C5A059]/50 transition-all placeholder:text-black/20"
                  />
                  <label className="bg-white border border-brand/20 hover:border-[#8c6239] rounded-xl px-4 py-3 text-xs font-bold text-black cursor-pointer select-none flex items-center justify-center shrink-0">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("/api/admin/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const data = await res.json();
                          if (data.success) {
                            const updated = [...founderCards];
                            updated[idx].imageUrl = data.url;
                            setFounderCards(updated);
                            setSuccess(`Card #${idx + 1} image uploaded!`);
                          } else {
                            setError("Failed to upload image.");
                          }
                        } catch {
                          setError("Error uploading image.");
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Text Description TextArea with toolbar helper */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Card Text (HTML / Bold allowed)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...founderCards];
                      updated[idx].text = (updated[idx].text || "") + " <b>bold text</b>";
                      setFounderCards(updated);
                    }}
                    className="text-[9px] font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer"
                    title="Inserts bold tags"
                  >
                    [+ Add Bold Text]
                  </button>
                </div>
                <textarea
                  value={card.text}
                  onChange={(e) => {
                    const updated = [...founderCards];
                    updated[idx].text = e.target.value;
                    setFounderCards(updated);
                  }}
                  placeholder="Enter description text. Use <b>text</b> to make letters bold."
                  rows={3}
                  className="w-full bg-white border border-brand/20 focus:border-[#C5A059]/50 rounded-xl px-4 py-3 text-xs font-semibold text-black outline-none transition-all placeholder:text-black/20 resize-y min-h-[60px]"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FAF6ED]" />
            ) : (
              <Save size={14} />
            )}
            <span>Save About Section Settings</span>
          </button>
        </form>
      </div>
    </div>
  );
}
