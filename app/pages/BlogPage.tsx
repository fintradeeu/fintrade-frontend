import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/card";
import { BookOpen, Calendar, Clock, ChevronRight, X } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedBlog(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col z-10 transform scale-100 transition-all duration-300">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 z-30 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto flex-grow">
              {/* Header Image */}
              {selectedBlog.thumbnail_url ? (
                <div className="w-full h-64 md:h-80 relative">
                  <img 
                    src={selectedBlog.thumbnail_url} 
                    alt={selectedBlog.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-[#D50032] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Blog Story
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-[#0B2A5B]/5 flex items-center justify-center relative">
                  <BookOpen size={48} className="text-[#0B2A5B]/20" />
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-[#D50032] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Blog Story
                    </span>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    5 min read
                  </div>
                  {selectedBlog.views_count !== undefined && (
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                      <span>{selectedBlog.views_count} views</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B2A5B] mb-6 leading-tight">
                  {selectedBlog.title}
                </h2>

                <div className="border-t border-gray-100 pt-6">
                  <div className="text-gray-700 text-base leading-relaxed space-y-4 font-medium whitespace-pre-wrap">
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
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-6 py-2.5 bg-[#0B2A5B] hover:bg-[#0B2A5B]/90 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
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
