"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
}

export default function FAQSettingsPage() {
  const router = useRouter();
  
  // State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
      } else {
        setError(data.error || "Failed to load FAQs.");
      }
      
      if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to fetch FAQs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const resetForm = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setDisplayOrder(0);
  };

  const handleEditClick = (faq: FAQ) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setDisplayOrder(faq.displayOrder);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError("Both question and answer are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = editingId 
        ? { id: editingId, question, answer, displayOrder }
        : { question, answer, displayOrder };

      const res = await fetch("/api/admin/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editingId ? "FAQ updated successfully!" : "FAQ added successfully!");
        resetForm();
        fetchData();
      } else {
        setError(data.error || "Failed to save FAQ.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("FAQ deleted successfully!");
        fetchData();
      } else {
        setError(data.error || "Failed to delete FAQ.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <Loader2 className="animate-spin text-[#8c6239] mb-4" size={40} />
        <p className="text-[#8c6239]/60 text-sm font-bold uppercase tracking-wider">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-brand-light text-brand-dark custom-scrollbar h-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-dark/10 pb-6">
          <div>
            <h1 className="text-3xl font-playfair font-black text-[#8c6239] tracking-tight">
              FAQs Settings
            </h1>
            <p className="text-[#8c6239]/60 text-xs font-semibold uppercase tracking-wider mt-1">
              Configure frequently asked questions for the storefront layout
            </p>
          </div>
        </div>

        {/* Notifications */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border-2 border-green-500/20 text-green-700 px-5 py-3 rounded-2xl animate-in fade-in duration-300">
            <Check size={18} className="text-green-600" />
            <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border-2 border-red-500/20 text-red-700 px-5 py-3 rounded-2xl animate-in fade-in duration-300">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {/* Form and List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add / Edit Form Column */}
          <div className="bg-[#FFFDF6] p-6 rounded-3xl border border-brand-accent/15 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#8c6239] uppercase tracking-tight">
              {editingId ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#8c6239]/60 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Is dry fish good for health?"
                  className="w-full bg-white border border-[#8c6239]/15 rounded-xl px-4 py-3 text-xs font-bold text-black focus:outline-none focus:border-brand-accent placeholder:text-[#8c6239]/35 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#8c6239]/60 mb-2">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide a detailed answer here..."
                  rows={6}
                  className="w-full bg-white border border-[#8c6239]/15 rounded-xl px-4 py-3 text-xs font-bold text-black focus:outline-none focus:border-brand-accent placeholder:text-[#8c6239]/35 shadow-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#8c6239]/60 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-white border border-[#8c6239]/15 rounded-xl px-4 py-3 text-xs font-bold text-black focus:outline-none focus:border-brand-accent shadow-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand hover:bg-brand-hover text-[#FAF6ED] font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={14} />
                      {editingId ? "Update" : "Save"}
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List FAQs Column */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-[#8c6239] uppercase tracking-tight mb-2">
              FAQs List ({faqs.length})
            </h2>

            {faqs.length === 0 ? (
              <div className="bg-[#FFFDF6] p-10 text-center border border-dashed border-[#8c6239]/15 rounded-3xl">
                <p className="text-[#8c6239]/40 font-bold uppercase tracking-widest text-xs">
                  No FAQs configured. Use the form to add some!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="bg-[#FFFDF6] p-5 rounded-2xl border border-brand-accent/15 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all animate-in fade-in duration-300"
                  >
                    <div className="flex-1 space-y-1.5 pr-0 md:pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-brand-light px-2 py-0.5 rounded text-brand-dark border border-brand-dark/5">
                          Order: {faq.displayOrder}
                        </span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-black">{faq.question}</h4>
                      <p className="text-xs text-black/60 font-semibold leading-relaxed line-clamp-3">{faq.answer}</p>
                    </div>

                    <div className="flex gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleEditClick(faq)}
                        className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
