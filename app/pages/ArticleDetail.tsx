import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import api from "../services/api";
import { Card } from "../components/ui/card";
import { ArrowLeft, Calendar, Clock, Eye, BookOpen, ChevronRight } from "lucide-react";

interface Article {
  id: number;
  title: string;
  type: string;
  description: string;
  thumbnail_url?: string;
  views_count: number;
  created_at: string;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestedArticle, setSuggestedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [suggestedImageError, setSuggestedImageError] = useState(false);

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setImageError(false);
      setSuggestedImageError(false);
      
      try {
        // 1. Fetch current article details (this also increments views)
        const res = await api.get(`/news/${id}`);
        setArticle(res.data);
        
        // 2. Fetch all articles to select a suggestion
        const listRes = await api.get("/news");
        const allArticles: Article[] = listRes.data;
        
        // Filter out the current article
        const otherArticles = allArticles.filter((a) => a.id !== Number(id) && a.status === "published");
        
        if (otherArticles.length > 0) {
          // Try to suggest one of the same type first, otherwise pick a random one
          const sameType = otherArticles.filter((a) => a.type === res.data.type);
          const pool = sameType.length > 0 ? sameType : otherArticles;
          const randomIndex = Math.floor(Math.random() * pool.length);
          setSuggestedArticle(pool[randomIndex]);
        } else {
          setSuggestedArticle(null);
        }
      } catch (err) {
        console.error("Failed to load article details:", err);
        setError("Could not load the article. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  // Handle scroll to top on routing
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center text-[#0B2A5B]/70 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#D50032] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-lg">Loading article details...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] pt-32 pb-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-md text-center border border-gray-100">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">Article Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "The article you are looking for does not exist."}</p>
          <button 
            onClick={() => navigate("/blog")}
            className="px-6 py-2.5 bg-[#0B2A5B] hover:bg-[#0B2A5B]/90 text-white font-extrabold rounded-xl transition-all shadow-sm"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-32 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back navigation header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-[#0B2A5B] hover:text-[#D50032] font-semibold transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Articles
          </button>
        </div>

        {/* Premium Article Container */}
        <article className="bg-white rounded-[32px] p-6 md:p-10 lg:p-12 shadow-xl border border-gray-100 mb-12">
          
          {/* Tag & Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-[#D50032]/10 text-[#D50032] text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              {article.type || "Blog Story"}
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                {article.created_at ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                5 min read
              </span>
              <span className="flex items-center gap-1.5 bg-[#0B2A5B]/5 px-2.5 py-1 rounded-md text-[#0B2A5B] font-semibold">
                <Eye size={14} />
                {article.views_count} views
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-4.5xl font-black text-[#0B2A5B] mb-8 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Featured Image */}
          {article.thumbnail_url && !imageError && (
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-sm border border-gray-100 bg-gray-50">
              <img 
                src={article.thumbnail_url} 
                alt={article.title} 
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Body */}
          <div className="border-t border-gray-100 pt-8">
            <div className="text-gray-700 text-lg md:text-xl leading-relaxed space-y-6 font-normal max-w-none prose prose-[#0B2A5B]">
              {article.description ? (
                article.description.split('\n').map((para: string, idx: number) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;
                  return <p key={idx} className="mb-5">{trimmed}</p>;
                })
              ) : (
                <p className="italic text-gray-400">No content available for this article.</p>
              )}
            </div>
          </div>

        </article>

        {/* Suggested Reads Section */}
        {suggestedArticle && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-black text-[#0B2A5B] mb-8 tracking-tight">
              Recommended for You
            </h2>
            
            <Card className="overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-3xl">
              {suggestedArticle.thumbnail_url && !suggestedImageError ? (
                <div className="md:w-1/3 aspect-video md:aspect-auto relative overflow-hidden bg-gray-100 min-h-[200px]">
                  <img 
                    src={suggestedArticle.thumbnail_url} 
                    alt={suggestedArticle.title} 
                    onError={() => setSuggestedImageError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur text-[#0B2A5B] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      {suggestedArticle.type}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="md:w-1/3 aspect-video md:aspect-auto flex items-center justify-center bg-[#0B2A5B]/5 min-h-[200px]">
                  <BookOpen size={48} className="text-[#0B2A5B]/20" />
                </div>
              )}
              
              <div className="p-6 md:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {suggestedArticle.created_at ? new Date(suggestedArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      5 min read
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0B2A5B] mb-3 group-hover:text-[#D50032] transition-colors line-clamp-2">
                    {suggestedArticle.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {suggestedArticle.description}
                  </p>
                </div>
                
                <div>
                  <Link 
                    to={`/article/${suggestedArticle.id}`}
                    className="inline-flex items-center text-[#D50032] font-semibold text-sm group/btn"
                  >
                    Read Story
                    <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
