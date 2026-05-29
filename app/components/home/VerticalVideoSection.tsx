import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Music, Eye, X, Maximize2 } from "lucide-react";
import { Card } from "../ui/card";

const verticalVideos = [
  {
    id: "v1",
    num: "#1",
    title: "How I Became a Funded Trader",
    author: "Rahul S.",
    views: "12K",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v2",
    num: "#2",
    title: "My First Profitable Trade",
    author: "Priya V.",
    views: "8.5K",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v3",
    num: "#3",
    title: "Risk Management Tips",
    author: "Amit P.",
    views: "15K",
    thumbnail: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v4",
    num: "#4",
    title: "Technical Analysis Basics",
    author: "Karan M.",
    views: "9.2K",
    isPlaying: true, // Mark active card like in the mockup
    thumbnail: "https://images.unsplash.com/photo-1616587896649-79b16d8b173d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v5",
    num: "#5",
    title: "Day Trading Routine",
    author: "Sneha R.",
    views: "11K",
    thumbnail: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "v6",
    num: "#6",
    title: "NIFTY Analysis Explained",
    author: "Vikram D.",
    views: "7.8K",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
];

export default function VerticalVideoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(3); // Default playing card
  const [isPaused, setIsPaused] = useState(false);
  const [inlinePlayingId, setInlinePlayingId] = useState<string | null>(null);
  const [fullscreenVideoId, setFullscreenVideoId] = useState<string | null>(null);
  const isReversingRef = useRef(false);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 270;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    isReversingRef.current = (dir === "left");
  };

  // Autoslide mechanism
  useEffect(() => {
    if (isPaused || !!inlinePlayingId || !!fullscreenVideoId) return; // Pause auto-sliding while video is playing
 
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
  }, [isPaused, inlinePlayingId, fullscreenVideoId]);

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
          const isInlinePlaying = inlinePlayingId === vid.id;
          return (
            <Card
              key={vid.id}
              onClick={() => {
                if (!isCurrentActive) {
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
              className={`flex-shrink-0 w-[240px] aspect-[9/16] overflow-hidden rounded-[32px] relative snap-center group transition-all duration-500 ease-out origin-center cursor-pointer ${
                isCurrentActive 
                  ? "border-2 border-[#D50032] shadow-[0_20px_45px_rgba(213,0,50,0.28)] scale-[1.06] hover:scale-[1.12] hover:shadow-[0_25px_50px_rgba(213,0,50,0.38)] z-20" 
                  : "border border-gray-150 hover:border-[#D50032]/45 shadow-md scale-[0.94] hover:scale-[1.02] opacity-55 hover:opacity-100 grayscale-[20%] hover:grayscale-0 blur-[0.3px] hover:blur-0 z-10"
              }`}
            >
              {isInlinePlaying ? (
                <div className="absolute inset-0 z-0 bg-black flex flex-col">
                  {/* Dedicated Header Bar for Custom Controls */}
                  <div className="h-11 w-full bg-[#121212] border-b border-white/10 flex items-center justify-between px-4 z-30 shrink-0">
                    <span className="text-[9px] font-black tracking-widest text-[#D50032] uppercase animate-pulse">
                      Playing Tip
                    </span>
                    <div className="flex gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenVideoId(vid.id);
                          setInlinePlayingId(null);
                        }}
                        className="w-7 h-7 bg-white/10 hover:bg-[#D50032] border border-white/15 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Open in Big Screen"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInlinePlayingId(null);
                        }}
                        className="w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Stop Playback"
                      >
                        <X className="w-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* YouTube Iframe Player below the header */}
                  <div className="flex-1 bg-black w-full overflow-hidden">
                    <iframe
                      src={`${vid.embedUrl}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full bg-black border-0"
                    />
                  </div>
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

                  {/* Top Bar with Badge, Fullscreen Maximize & Music Icon */}
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
                    <div className="flex gap-1.5 items-center">
                      {/* Big Screen Maximizer Trigger Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenVideoId(vid.id);
                        }}
                        className="w-7 h-7 rounded-full bg-white/20 hover:bg-[#D50032] backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                        title="Open in Big Screen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
                        <Music className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Play Button Icon Overlay in the center */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(idx);
                        setInlinePlayingId(vid.id);
                        if (scrollRef.current) {
                          const cardWidth = 240 + 20;
                          scrollRef.current.scrollTo({
                            left: idx * cardWidth,
                            behavior: "smooth"
                          });
                        }
                      }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-350 cursor-pointer shadow-lg ${
                        isCurrentActive 
                          ? "bg-[#D50032] text-white hover:scale-110 shadow-[#D50032]/35" 
                          : "bg-white/15 text-white backdrop-blur-sm border-2 border-white/30 hover:bg-[#D50032] hover:border-transparent group-hover:scale-105"
                      }`}
                      title="Play Inline"
                    >
                      <Play className="w-6 h-6 fill-current text-white ml-0.5" />
                    </button>
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
      </div>      {/* Big Screen Video Modal / Lightbox Overlay */}
      {fullscreenVideoId && (() => {
        const activeVid = verticalVideos.find(v => v.id === fullscreenVideoId);
        if (!activeVid) return null;
        return (
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
            onClick={() => setFullscreenVideoId(null)}
          >
            {/* Video Player & Cancel Button Container */}
            <div 
              className="flex flex-col items-center gap-5 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Vertical aspect ratio matching standard phone reel player */}
              <div className="relative w-[300px] sm:w-[350px] md:w-[380px] aspect-[9/16] bg-black rounded-[36px] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
                <iframe
                  src={`${activeVid.embedUrl}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
                  title={activeVid.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full bg-black border-0"
                />
              </div>

              {/* Big visual "Cancel / Close" button directly below the vertical player */}
              <button
                onClick={() => setFullscreenVideoId(null)}
                className="px-8 py-3 bg-[#D50032] hover:bg-[#FF1A4D] text-white font-extrabold rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider text-xs uppercase cursor-pointer border border-transparent"
              >
                <X className="w-4 h-4 text-white stroke-[3]" />
                Cancel / Close
              </button>
            </div>
          </div>
        );
      })()}

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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.22s ease-out forwards;
        }
        .animate-scale-up {
          animation: scale-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </section>
  );
}
