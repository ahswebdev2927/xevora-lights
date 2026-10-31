"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Calendar, User, FileText, X } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  author: string;
}

export default function BlogsPage() {
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBlog, setActiveBlog] = useState<Blog | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        if (data.success) {
          setBlogsList(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 w-full bg-[#FAF6ED]">
        <Loader2 className="animate-spin text-[#8c6239] mb-4" size={48} strokeWidth={1.5} />
        <p className="text-black/40 font-black uppercase tracking-[0.3em] text-[10px]">Loading our stories...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-24">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-4 border-b border-[#8c6239]/10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif font-black text-[#8c6239] leading-tight">
            Our Blog &amp; Recipes
          </h1>
          <p className="text-xs md:text-sm text-black/60 font-medium leading-relaxed">
            Discover traditional dry fish recipes, culinary tips, and stories directly from the traditional coastal kitchens.
          </p>
        </div>
      </section>

      {/* Blogs Listings Horizontal List */}
      <section className="max-w-4xl mx-auto px-6 pt-6 pb-12">
        {blogsList.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-[#8c6239]/10 shadow-sm max-w-xl mx-auto px-8 space-y-4">
            <div className="w-16 h-16 bg-[#8c6239]/5 rounded-full flex items-center justify-center mx-auto text-[#8c6239]">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-serif font-black text-black">New Stories Coming Soon</h3>
            <p className="text-black/60 leading-relaxed text-xs max-w-sm mx-auto">
              We are currently preparing authentic recipes and articles. Please check back shortly!
            </p>
            <Link 
              href="/" 
              className="inline-block px-8 py-3.5 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-md active:scale-95"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {blogsList.map((blog) => (
              <article
                key={blog.id}
                className="bg-[#FFFDF6] border border-[#8c6239]/15 rounded-[2rem] overflow-hidden p-4 md:p-6 flex flex-row gap-4 md:gap-6 shadow-sm hover:shadow-md transition-all text-left items-center"
              >
                {/* Small cover image to the left */}
                {blog.coverImage && (
                  <div className="w-20 h-20 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-[#8c6239]/10 bg-brand/5">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                )}
                
                {/* Card content on the right */}
                <div className="flex-grow flex flex-col justify-between space-y-2 md:space-y-3">
                  <div className="space-y-1 md:space-y-2">
                    <h2 className="text-sm md:text-lg font-serif font-black text-[#3b2314] leading-tight">
                      {blog.title}
                    </h2>
                    <div className="text-[9px] md:text-[10px] font-black text-black/40 uppercase tracking-widest">
                      {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <p className="text-[11px] md:text-xs text-black/75 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">
                      {blog.summary}
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => setActiveBlog(blog)}
                      className="text-[10px] md:text-xs font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer focus:outline-none"
                    >
                      Read more...
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Full Blog Details Pop-up Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#8c6239]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setActiveBlog(null)} />
          
          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-[#8c6239]/15">
            {/* Header */}
            <div className="p-6 border-b border-[#8c6239]/10 flex items-center justify-between bg-brand/5">
              <div className="space-y-1">
                <h2 className="text-base md:text-lg font-serif font-black text-[#3b2314] leading-tight">
                  {activeBlog.title}
                </h2>
                <div className="flex items-center gap-4 text-[10px] font-black text-black/40 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <User size={10} className="text-[#8c6239]" />
                    {activeBlog.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} className="text-[#8c6239]" />
                    {new Date(activeBlog.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveBlog(null)}
                className="p-2 text-black hover:bg-[#8c6239]/10 rounded-full transition-all cursor-pointer shrink-0 ml-4"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#3b2314] custom-scrollbar text-justify">
              {activeBlog.coverImage && (
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#8c6239]/15 shadow-sm bg-brand/5">
                  <img
                    src={activeBlog.coverImage}
                    alt={activeBlog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/placeholder.png";
                    }}
                  />
                </div>
              )}
              
              <p className="text-xs md:text-sm font-bold text-[#8c6239] leading-relaxed border-l-4 border-[#8c6239] pl-4 italic">
                {activeBlog.summary}
              </p>

              <div 
                className="prose max-w-none text-[#3b2314] text-xs md:text-sm font-medium leading-relaxed space-y-4 pt-2 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: activeBlog.content }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-brand/5 border-t border-[#8c6239]/10 flex justify-end">
              <button
                onClick={() => setActiveBlog(null)}
                className="bg-[#8c6239] hover:bg-[#734f2d] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
