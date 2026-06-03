import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/card";
import { BookOpen, Calendar, Clock, ChevronRight, X } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/news");
        const blogItems = res.data.filter((n: any) => (n.type || (n.video_url ? "Market Update" : "Blog Story")) === "Blog Story");
        setBlogs(blogItems);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleReadArticle = async (blog: any) => {
    setImageError(false); // Reset image error state for the new article
    setSelectedBlog(blog); // Open modal immediately for instant feedback
    try {
      // Record view and fetch latest details (including updated views_count)
      const res = await api.get(`/news/${blog.id}`);
      setSelectedBlog(res.data);
      
      // Update the views count in the main list so it matches
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, views_count: res.data.views_count } : b));
    } catch (err) {
      console.error("Failed to register view:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] py-20 px-6">
      <div className="max-w-7xl mx-auto mt-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B2A5B] mb-4">
            Insights & Articles
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deep dive into trading psychology, market fundamentals, and technical analysis strategies written by our experts.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#0B2A5B]/60">Loading latest articles...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <BookOpen size={48} className="mx-auto text-[#0B2A5B]/20 mb-4" />
            <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">No Articles Found</h3>
            <p className="text-gray-500">Check back later for new trading insights.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 border-none bg-white">
                <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                  {blog.thumbnail_url ? (
                    <img 
                      src={blog.thumbnail_url} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0B2A5B]/5">
                      <BookOpen size={48} className="text-[#0B2A5B]/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur text-[#0B2A5B] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Article
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      5 min read
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0B2A5B] mb-3 line-clamp-2 group-hover:text-[#D50032] transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {blog.description}
                  </p>
                  
                  <div 
                    onClick={() => handleReadArticle(blog)}
                    className="mt-auto flex items-center text-[#D50032] font-semibold text-sm cursor-pointer group/btn"
                  >
                    Read Full Article 
                    <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with premium brand navy-tinted blur */}
          <div 
            className="absolute inset-0 bg-[#0B2A5B]/30 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setSelectedBlog(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col z-10 transform scale-100 transition-all duration-300 border border-gray-100">
            
            {/* Header bar (sticky/fixed) with Close button */}
            <div className="flex justify-between items-center px-6 py-4 md:px-8 border-b border-gray-100 flex-shrink-0">
              <span className="bg-[#D50032]/10 text-[#D50032] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedBlog.type || "Blog Story"}
              </span>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-[#0B2A5B] hover:bg-gray-100 p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 md:p-8 flex-grow scrollbar-thin">
              
              {/* Optional Header Image (only shown if thumbnail_url is valid and successfully loads) */}
              {selectedBlog.thumbnail_url && !imageError ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-sm border border-gray-100 bg-gray-50">
                  <img 
                    src={selectedBlog.thumbnail_url} 
                    alt={selectedBlog.title} 
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#D50032]" />
                  {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#D50032]" />
                  5 min read
                </div>
                {selectedBlog.views_count !== undefined && (
                  <div className="flex items-center gap-1.5 bg-[#0B2A5B]/5 px-2.5 py-1 rounded-md text-[#0B2A5B]">
                    <span>{selectedBlog.views_count} views</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3.5xl font-black text-[#0B2A5B] mb-6 leading-tight tracking-tight">
                {selectedBlog.title}
              </h2>

              {/* Paragraphs Description */}
              <div className="border-t border-gray-100 pt-6">
                <div className="text-gray-700 text-base md:text-lg leading-relaxed space-y-5 font-normal">
                  {selectedBlog.description ? (
                    selectedBlog.description.split('\n').map((para: string, idx: number) => {
                      const trimmed = para.trim();
                      if (!trimmed) return null;
                      return <p key={idx} className="mb-4">{trimmed}</p>;
                    })
                  ) : (
                    <p className="italic text-gray-400">No content available for this article.</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 p-5 bg-gray-50 flex justify-end rounded-b-[32px] flex-shrink-0">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-6 py-2.5 bg-[#0B2A5B] hover:bg-[#0B2A5B]/90 text-white font-extrabold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer transform active:scale-98"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
