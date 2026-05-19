import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../ui/card";
import ShareButton from "../ShareButton";

const verticalVideos = [
  {
    id: "v1",
    title: "How I Became a Funded Trader",
    author: "Rahul S.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "12K",
  },
  {
    id: "v2",
    title: "My First Profitable Trade",
    author: "Priya V.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "8.5K",
  },
  {
    id: "v3",
    title: "Risk Management Tips",
    author: "Amit P.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "15K",
  },
  {
    id: "v4",
    title: "Technical Analysis Basics",
    author: "Karan M.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "9.2K",
  },
  {
    id: "v5",
    title: "Day Trading Routine",
    author: "Sneha R.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "11K",
  },
  {
    id: "v6",
    title: "NIFTY Analysis Explained",
    author: "Vikram D.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    views: "7.8K",
  },
];

export default function VerticalVideoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || (e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grabbing";
      scrollRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // Increased scroll speed for better feel
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.removeProperty("user-select");
    }
  };

  return (
    <section className="py-8 relative z-10" style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <div className="text-center mb-6 cursor-grab active:cursor-grabbing select-none">
          <div className="inline-block px-4 py-2 rounded-full mb-3 border border-[#D50032]/40" style={{ background: "rgba(213,0,50,0.1)" }}>
            <span className="text-[#D50032] font-semibold text-sm">📱 Short Videos</span>
          </div>
          <h2 className="text-4xl font-bold mb-3 text-white">Quick Trading Tips</h2>
          <p className="text-xl text-gray-400">Bite-sized trading wisdom from our community</p>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); scroll("left"); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D50032] transition-all -ml-2 lg:-ml-6 shadow-xl border border-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); scroll("right"); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#D50032] transition-all -mr-2 lg:-mr-6 shadow-xl border border-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide cursor-grab select-none active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {verticalVideos.map((vid) => (
              <Card
                key={vid.id}
                className="flex-shrink-0 w-[240px] overflow-hidden border border-[#D50032]/20 hover:border-[#D50032]/50 transition-all hover:shadow-2xl group"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {/* 9:16 Video Container */}
                <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
                  <iframe
                    src={vid.embedUrl}
                    title={vid.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {/* Info */}
                <div className="p-3">
                  <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{vid.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{vid.author}</span>
                    <div className="flex items-center gap-2">
                      <span>{vid.views} views</span>
                      <ShareButton title={vid.title} variant="icon" className="[&_button]:text-gray-400 [&_button]:hover:text-[#D50032]" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
