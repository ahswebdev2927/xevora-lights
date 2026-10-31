"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Loader2, Calendar, User, ArrowLeft, ChevronRight } from "lucide-react";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlogDetail() {
      try {
        const res = await fetch(`/api/blogs?slug=${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBlog(data.data);
        } else {
          setError(data.error || "Blog not found");
        }
      } catch (err) {
        setError("An unexpected error occurred while loading the blog.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBlogDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 w-full bg-[#FAF6ED]">
        <Loader2 className="animate-spin text-[#8c6239] mb-4" size={48} strokeWidth={1.5} />
        <p className="text-black/40 font-black uppercase tracking-[0.3em] text-[10px]">Loading article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-[#FAF6ED]">
        <h2 className="text-2xl font-serif font-black text-[#8c6239] mb-4">Blog Post Not Found</h2>
        <p className="text-black/60 mb-8 text-sm">We couldn't find the article you are looking for.</p>
        <Link
          href="/blogs"
          className="flex items-center gap-2 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Back to Blogs</span>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF6ED] text-[#3b2314] font-sans selection:bg-[#8c6239]/20 pb-24">
      {/* Breadcrumbs */}
      <nav className="max-w-4xl mx-auto px-6 pt-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-wider text-black/40">
        <Link href="/" className="hover:text-[#8c6239] transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link href="/blogs" className="hover:text-[#8c6239] transition-colors">Blog</Link>
        <ChevronRight size={10} />
        <span className="text-black/85 truncate max-w-[200px]">{blog.title}</span>
      </nav>

      <article className="max-w-4xl mx-auto px-6 pt-6">
        <div className="space-y-6">
          {/* Header Block */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-[#3b2314] leading-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-6 text-xs font-black text-black/45 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[#8c6239]" />
                {blog.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#8c6239]" />
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="aspect-[21/9] w-full rounded-[2rem] overflow-hidden border border-[#8c6239]/15 shadow-sm bg-brand/5">
            <img
              src={blog.coverImage || "/images/placeholder.png"}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />
          </div>

          {/* Summary / Lead Paragraph */}
          <p className="text-sm font-bold text-[#8c6239] leading-relaxed border-l-4 border-[#8c6239] pl-4 italic">
            {blog.summary}
          </p>

          {/* Content Block */}
          <div 
            className="prose max-w-none text-[#3b2314] text-xs md:text-sm font-medium leading-relaxed space-y-6 text-justify whitespace-pre-wrap pt-4"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Back Footer Link */}
          <div className="pt-12 border-t border-[#8c6239]/10 flex justify-between items-center">
            <Link
              href="/blogs"
              className="flex items-center gap-2 bg-[#8c6239]/5 border border-[#8c6239]/20 hover:bg-[#8c6239]/10 text-black px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to all stories</span>
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
