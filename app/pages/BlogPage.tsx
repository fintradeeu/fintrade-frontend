import { useState, useEffect } from "react";
import api from "../services/api";
import { Card } from "../components/ui/card";
import { BookOpen, Calendar, Clock, ChevronRight } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                  
                  <div className="mt-auto flex items-center text-[#D50032] font-semibold text-sm cursor-pointer group/btn">
                    Read Full Article 
                    <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
