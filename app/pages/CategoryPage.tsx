import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Video, FileText, Users, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const categoryData: Record<string, { title: string; description: string; courses: { name: string; level: string; duration: string; students: number }[]; videos: { title: string; views: string }[]; articles: { title: string; readTime: string }[] }> = {
  "stock-market-basics": {
    title: "Stock Market Basics",
    description: "Learn the fundamentals of stock markets, exchanges, and trading instruments",
    courses: [
      { name: "Introduction to Stock Markets", level: "Beginner", duration: "4 weeks", students: 850 },
      { name: "Understanding NSE & BSE", level: "Beginner", duration: "2 weeks", students: 620 },
    ],
    videos: [
      { title: "What is a Stock Exchange?", views: "25K" },
      { title: "How to Open a Demat Account", views: "18K" },
    ],
    articles: [
      { title: "Complete Guide to Indian Stock Markets", readTime: "8 min" },
      { title: "SEBI Regulations Every Trader Should Know", readTime: "6 min" },
    ],
  },
  "technical-analysis": {
    title: "Technical Analysis",
    description: "Master chart patterns, indicators, and price action strategies",
    courses: [
      { name: "Candlestick Patterns Mastery", level: "Intermediate", duration: "3 weeks", students: 720 },
      { name: "Advanced Indicator Strategies", level: "Advanced", duration: "4 weeks", students: 480 },
    ],
    videos: [
      { title: "Top 10 Candlestick Patterns", views: "32K" },
      { title: "RSI & MACD Strategy", views: "21K" },
    ],
    articles: [
      { title: "Chart Patterns That Actually Work", readTime: "10 min" },
    ],
  },
  "options-trading": {
    title: "Options Trading",
    description: "Understand options pricing, Greeks, and strategy building",
    courses: [
      { name: "Options Basics", level: "Intermediate", duration: "3 weeks", students: 560 },
      { name: "Iron Condor & Straddle Strategies", level: "Advanced", duration: "4 weeks", students: 340 },
    ],
    videos: [
      { title: "Options Trading for Beginners", views: "28K" },
    ],
    articles: [
      { title: "Understanding Option Greeks", readTime: "12 min" },
    ],
  },
  "futures-derivatives": {
    title: "Futures & Derivatives",
    description: "Deep dive into futures contracts and derivative instruments",
    courses: [
      { name: "Futures Trading 101", level: "Intermediate", duration: "3 weeks", students: 410 },
    ],
    videos: [
      { title: "Futures vs Options Explained", views: "15K" },
    ],
    articles: [
      { title: "Hedging with Futures Contracts", readTime: "9 min" },
    ],
  },
  "risk-management": {
    title: "Risk Management",
    description: "Learn position sizing, stop-loss strategies, and capital protection",
    courses: [
      { name: "Risk Management Fundamentals", level: "Beginner", duration: "2 weeks", students: 780 },
    ],
    videos: [
      { title: "Position Sizing Explained", views: "19K" },
    ],
    articles: [
      { title: "The 2% Rule in Trading", readTime: "5 min" },
    ],
  },
  "algorithmic-trading": {
    title: "Algorithmic Trading",
    description: "Build automated trading systems and quantitative strategies",
    courses: [
      { name: "Python for Trading", level: "Advanced", duration: "6 weeks", students: 290 },
      { name: "Building Trading Bots", level: "Expert", duration: "4 weeks", students: 180 },
    ],
    videos: [
      { title: "Algo Trading with Python", views: "12K" },
    ],
    articles: [
      { title: "Getting Started with Algo Trading", readTime: "15 min" },
    ],
  },
};

const allCategories = Object.entries(categoryData).map(([slug, data]) => ({ slug, title: data.title }));

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? categoryData[slug] : null;

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F5" }}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link to="/"><Button style={{ background: "#D50032", color: "white" }}>Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.title}</h1>
          <p className="text-xl text-gray-400">{category.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Courses */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: "#121212" }}>
                <BookOpen className="h-6 w-6" style={{ color: "#D50032" }} /> Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.courses.map((c, i) => (
                  <Card key={i} className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all hover:shadow-xl">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: "rgba(213,0,50,0.1)", color: "#D50032" }}>{c.level}</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: "#121212" }}>{c.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {c.duration}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {c.students}</span>
                    </div>
                    <Link to="/student/courses">
                      <Button className="w-full" style={{ background: "#D50032", color: "white" }}>View Course</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: "#121212" }}>
                <Video className="h-6 w-6" style={{ color: "#D50032" }} /> Videos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.videos.map((v, i) => (
                  <Card key={i} className="p-6 border-2 border-gray-100 hover:border-[#D50032] transition-all hover:shadow-xl">
                    <h3 className="font-bold mb-2" style={{ color: "#121212" }}>{v.title}</h3>
                    <span className="text-sm text-gray-500">{v.views} views</span>
                  </Card>
                ))}
              </div>
            </div>

            {/* Articles */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: "#121212" }}>
                <FileText className="h-6 w-6" style={{ color: "#D50032" }} /> Articles
              </h2>
              <div className="space-y-4">
                {category.articles.map((a, i) => (
                  <Card key={i} className="p-5 border-2 border-gray-100 hover:border-[#D50032] transition-all hover:shadow-md cursor-pointer">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold" style={{ color: "#121212" }}>{a.title}</h3>
                      <span className="text-sm text-gray-400">{a.readTime} read</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4" style={{ color: "#121212" }}>All Categories</h3>
              <div className="space-y-2">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className={`block px-4 py-3 rounded-lg transition-all text-sm font-medium ${cat.slug === slug ? "text-white" : "text-gray-700 hover:bg-red-50 hover:text-[#D50032]"}`}
                    style={cat.slug === slug ? { background: "#D50032" } : {}}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
