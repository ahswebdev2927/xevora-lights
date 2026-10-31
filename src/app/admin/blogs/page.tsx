"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Edit2, X, Check, AlertCircle, Upload, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("Admin");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success) {
        setBlogsList(data.data || []);
      }
    } catch (err) {
      setError("Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingBlog) {
      setSlug(title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"));
    }
  }, [title, editingBlog]);

  const handleOpenAddForm = () => {
    setEditingBlog(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setCoverImage("");
    setAuthor("Admin");
    setSuccess("");
    setError("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setSummary(blog.summary);
    setContent(blog.content);
    setCoverImage(blog.coverImage);
    setAuthor(blog.author || "Admin");
    setSuccess("");
    setError("");
    setIsFormOpen(true);
  };

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.url);
        setSuccess("Cover image uploaded successfully!");
      } else {
        setError(data.error || "Failed to upload cover image.");
      }
    } catch {
      setError("An error occurred during file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !summary || !content || !coverImage) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      id: editingBlog?.id,
      title,
      slug,
      summary,
      content,
      coverImage,
      author,
    };

    try {
      const endpoint = editingBlog ? "/api/admin/blogs" : "/api/admin/blogs";
      const method = editingBlog ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingBlog ? "Blog post updated successfully!" : "Blog post added successfully!");
        setIsFormOpen(false);
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to save blog post.");
      }
    } catch {
      setError("An error occurred while saving the blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Blog post deleted successfully!");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete blog post.");
      }
    } catch {
      setError("An error occurred while deleting the blog post.");
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
    <div className="p-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-black">Blogs &amp; Stories</h1>
          <p className="mt-2 text-black/60 font-medium tracking-tight">
            Create, edit and manage articles and recipe blogs shown on your storefront.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-md cursor-pointer"
        >
          <Plus size={16} />
          <span>New Blog Post</span>
        </button>
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

      {/* Blogs Grid List */}
      {blogsList.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-brand/5 shadow-sm max-w-xl mx-auto px-6">
          <div className="w-16 h-16 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8c6239]">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">No Blog Posts Yet</h3>
          <p className="text-black/40 mb-6 text-xs leading-relaxed max-w-sm mx-auto">
            Share news, recipe guides, and stories about traditional dry fish recipes with your storefront buyers.
          </p>
          <button
            onClick={handleOpenAddForm}
            className="px-6 py-3 bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogsList.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-[2rem] border border-brand/5 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="aspect-[16/9] w-full bg-brand/5 relative overflow-hidden">
                <img
                  src={blog.coverImage || "/images/placeholder.png"}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/placeholder.png";
                  }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black text-black/40 uppercase tracking-wider mb-2">
                    <span>By {blog.author || "Admin"}</span>
                    <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-black line-clamp-2 leading-tight mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-black/60 line-clamp-3 leading-relaxed mb-4">
                    {blog.summary}
                  </p>
                </div>
                <div className="flex gap-2 pt-4 border-t border-brand/5">
                  <button
                    onClick={() => handleOpenEditForm(blog)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand/5 hover:bg-brand/10 text-black py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Form Drawer / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#8c6239]/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <h2 className="text-xl font-playfair font-bold text-black">
                {editingBlog ? "Edit Blog Post" : "Create Blog Post"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-brand/10 rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Paste cover image URL here"
                    className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                    required
                  />
                  <label className="bg-brand/5 border border-brand/20 hover:border-[#8c6239] rounded-2xl px-5 py-4 text-xs font-bold text-black cursor-pointer select-none flex items-center justify-center shrink-0">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCoverImage}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Blog Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional way to sun-dry dry prawns"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="slug-url-endpoint"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Short Summary (displayed in listings)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief synopsis of what this article is about..."
                  rows={2}
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20 resize-y"
                  required
                />
              </div>

              {/* Content text */}
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">Blog Article Body (HTML / Bold allowed)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setContent((prev) => prev + " <b>bold text</b>");
                    }}
                    className="text-[9px] font-black uppercase tracking-wider text-[#8c6239] hover:underline cursor-pointer"
                  >
                    [+ Add Bold Text]
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full recipe details or story. HTML markup is allowed to format paragraphs and bold headers."
                  rows={8}
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20 resize-y min-h-[150px]"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2 ml-1">Author Name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Venky"
                  className="w-full bg-brand/5 border border-transparent focus:border-[#C5A059]/50 rounded-2xl px-5 py-4 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/20"
                />
              </div>

              <div className="pt-4 border-t border-brand/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-black/60 hover:bg-brand/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="bg-[#8c6239] hover:bg-[#734f2d] text-[#FAF6ED] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Publish Blog Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
