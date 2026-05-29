import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Music, Eye, X } from "lucide-react";
import { Card } from "../ui/card";

const verticalVideos = [
  {
    id: "v1",
    num: "#1",
    title: "How I Became a Funded Trader",
    author: "Rahul S.",
    views: "12K",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tablet-displaying-financial-charts-40433-large.mp4"
  },
  {
    id: "v2",
    num: "#2",
    title: "My First Profitable Trade",
    author: "Priya V.",
    views: "8.5K",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-financial-data-on-a-monitor-screen-40431-large.mp4"
  },
  {
    id: "v3",
    num: "#3",
    title: "Risk Management Tips",
    author: "Amit P.",
    views: "15K",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-charts-on-a-laptop-42171-large.mp4"
  },
  {
    id: "v4",
    num: "#4",
    title: "Technical Analysis Basics",
    author: "Karan M.",
    views: "9.2K",
    isPlaying: true, // Mark active card like in the mockup
    thumbnail: "https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-financial-charts-on-a-computer-screen-40432-large.mp4"
  },
  {
    id: "v5",
    num: "#5",
    title: "Day Trading Routine",
    author: "Sneha R.",
    views: "11K",
    thumbnail: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tablet-displaying-financial-charts-40433-large.mp4"
  },
  {
    id: "v6",
    num: "#6",
    title: "NIFTY Analysis Explained",
    author: "Vikram D.",
    views: "7.8K",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-financial-data-on-a-monitor-screen-40431-large.mp4"
  },
];

export default function VerticalVideoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(3); // Default playing card
  const [isPaused, setIsPaused] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const isReversingRef = useRef(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 270;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    isReversingRef.current = (dir === "left");
  };

  // Autoslide mechanism
  useEffect(() => {
    if (isPaused || !!playingVideoId) return; // Pause auto-sliding while video is playing

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % verticalVideos.length;

        if (scrollRef.current) {
          const container = scrollRef.current;
          const cardWidth = 240 + 20; // width + gap
          container.scrollTo({
            left: nextIndex * cardWidth,
            behavior: "smooth"
          });
        }
        return nextIndex;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isPaused, playingVideoId]);

  // Handle manual scroll update active index
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 240 + 20; // width + gap
    const idx = Math.round(scrollLeft / cardWidth);
    if (idx >= 0 && idx < verticalVideos.length) {
      setActiveIndex(idx);
    }
  };

  return (
    <section className="py-12 bg-white relative z-10 overflow-hidden border-t border-gray-100">
      
      {/* Header and Controls Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Left-aligned with top badge and right-aligned buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
          <div className="text-left select-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3.5 border border-[#D50032]/25 bg-[#D50032]/5">
              <span className="text-[#D50032] font-black text-[10px] md:text-xs tracking-wider uppercase flex items-center gap-1">
                🎬 Short Videos
              </span>
            </div>
            <h2 className="text-3xl sm:text-4.5xl font-black mb-3 text-gray-900 tracking-tight">
              Quick <span className="text-[#D50032]">Trading Tips</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-semibold max-w-2xl leading-relaxed">
              Bite-sized trading wisdom from our community.
            </p>
          </div>

          {/* Nav buttons aligned to right */}
          <div className="flex gap-3 self-start md:self-end">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all duration-300 active:scale-95 shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-[#D50032] hover:bg-[#FF1A4D] flex items-center justify-center text-white transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(213,0,50,0.3)]"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container - Bleeding Edge-to-Edge with left alignment padding */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-5 overflow-x-auto py-14 items-center scrollbar-hide snap-x snap-mandatory w-full px-4 md:pl-[calc((100vw-1280px)/2+2rem)]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {verticalVideos.map((vid, idx) => {
          const isCurrentActive = idx === activeIndex;
          const isVideoPlaying = playingVideoId === vid.id;
          return (
            <Card
              key={vid.id}
              onClick={() => {
                if (isVideoPlaying) {
                  setPlayingVideoId(null);
                } else {
                  setPlayingVideoId(vid.id);
                  setActiveIndex(idx);
                  if (scrollRef.current) {
                    const cardWidth = 240 + 20;
                    scrollRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: "smooth"
                    });
                  }
                }
              }}
              className={`flex-shrink-0 w-[240px] aspect-[9/16] overflow-hidden rounded-[32px] relative snap-center group transition-all duration-500 origin-center cursor-pointer ${
                isCurrentActive 
                  ? "border-2 border-[#D50032] shadow-[0_20px_45px_rgba(213,0,50,0.28)] scale-[1.06] z-20" 
                  : "border border-gray-150 hover:border-[#D50032]/30 shadow-md scale-[0.94] opacity-50 grayscale-[20%] blur-[0.3px] z-10"
              }`}
            >
              {isVideoPlaying ? (
                <div className="absolute inset-0 z-0 bg-black flex items-center justify-center p-4">
                  <video
                    src={vid.videoUrl}
                    autoPlay
                    controls
                    loop
                    playsInline
                    className="w-full h-full object-contain rounded-2xl bg-black"
                  />
                  {/* Close/Stop Playback Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingVideoId(null);
                    }}
                    className="absolute top-6 right-6 z-30 text-white/80 hover:text-white bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-all shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  {/* Background Thumbnail Image with dark overlay */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={vid.thumbnail} 
                      alt={vid.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
                  </div>

                  {/* Top Bar with Badge & Music Icon */}
                  <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
                    {isCurrentActive ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black text-white bg-[#D50032] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                        NOW PLAYING
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 rounded-full text-[9px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/10">
                        {vid.num}
                      </div>
                    )}
                    <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Play Button Icon Overlay in the center */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-350 cursor-pointer shadow-lg ${
                      isCurrentActive 
                        ? "bg-[#D50032] text-white hover:scale-110 shadow-[#D50032]/35" 
                        : "bg-white/15 text-white backdrop-blur-sm border-2 border-white/30 hover:bg-[#D50032] hover:border-transparent group-hover:scale-105"
                    }`}>
                      <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Text Content & Views Count */}
                  <div className="absolute bottom-5 inset-x-5 z-10 flex flex-col justify-end text-left select-none">
                    <h3 className="font-extrabold text-white text-base leading-snug mb-2.5 drop-shadow-sm group-hover:text-[#D50032] transition-colors duration-300">
                      {vid.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                      <span>{vid.author}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        {vid.views}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dot Indicators Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dot Indicators at the bottom */}
        <div className="flex gap-1.5 justify-center items-center mt-6 w-full">
          {verticalVideos.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  if (scrollRef.current) {
                    const cardWidth = 240 + 20;
                    scrollRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: "smooth"
                    });
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? "w-5 bg-[#D50032]" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
