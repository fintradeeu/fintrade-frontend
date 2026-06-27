import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { leaders as staticLeaders } from "../data/leaders";
import api from "../services/api";

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  if (path === "/shankar_goenka.png") return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const getLeaderId = (leader: any) => {
  if (leader.id) return leader.id;
  if (leader.name) {
    return leader.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  }
  return "";
};

export default function OurAdvisors() {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/settings/advisors")
      .then((res) => {
        const advisorsList = res.data?.advisors || [];
        if (advisorsList && advisorsList.length > 0) {
          const list = advisorsList.map((dl: any) => {
            const imagePath = dl.profile_image || dl.image;
            const imageUrl = imagePath 
              ? getImageUrl(imagePath) 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(dl.name || "FT")}&background=FFF0F2&color=D50032&size=512&font-size=0.33&bold=true`;

            const rawTags = dl.tags || [];
            const parsedTags = Array.isArray(rawTags)
              ? rawTags
              : typeof rawTags === "string"
                ? rawTags.split(",").map((t: string) => t.trim()).filter(Boolean)
                : [];

            return {
              ...dl,
              id: getLeaderId(dl),
              image: imageUrl,
              role: dl.role || dl.title || "",
              fullBio: dl.fullBio || dl.bio || "",
              tags: parsedTags
            };
          });
          setAdvisors(list);
        } else {
          const list = staticLeaders.map((sl: any) => {
            return {
              ...sl,
              image: getImageUrl(sl.image),
              tags: sl.tags || []
            };
          });
          setAdvisors(list);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dynamic advisors list", err);
        const list = staticLeaders.map((sl: any) => {
          return {
            ...sl,
            image: getImageUrl(sl.image),
            tags: sl.tags || []
          };
        });
        setAdvisors(list);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#D50032]/20 border-t-[#D50032] animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading advisors...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative pt-24 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-4 border border-[#D50032]/25 bg-[#D50032]/5">
            <span className="text-[#D50032] font-black text-xs tracking-wider uppercase">
              👥 Our Advisors
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900 tracking-tight">
            Meet Our <span className="text-[#D50032]">Advisors</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Renowned experts guiding FinTrade's academic structure and strategic vision
          </p>
        </div>

        {/* Advisors Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto select-none">
          {advisors.map((leader, i) => {
            const leaderId = leader.id;
            const isMonogram = !leader.profile_image && (!leader.image || leader.image.includes("ui-avatars.com"));
            const initials = leader.initials || "FT";

            return (
              <div 
                key={i} 
                className="p-5 bg-white border border-gray-100 rounded-[28px] shadow-[0_10px_35px_rgba(0,0,0,0.012)] hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-[#D50032]/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="mb-6 overflow-hidden rounded-[20px] w-full aspect-square bg-gray-50 flex items-center justify-center border border-gray-100 relative group-hover:border-[#D50032]/20 transition-colors">
                    {isMonogram ? (
                      <div className="w-full h-full bg-[#FFF0F2] flex items-center justify-center select-none">
                        <span className="text-[#D50032] font-bold text-5xl tracking-tight">
                          {initials}
                        </span>
                      </div>
                    ) : (
                      <img 
                        src={leader.image} 
                        alt={leader.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                  </div>
                  
                  <div className="text-center mb-6">
                    <h3 className="font-extrabold text-gray-950 text-xl leading-snug">{leader.name}</h3>
                    <p className="text-[#D50032] text-xs font-black tracking-wide uppercase mt-1.5">{leader.role}</p>
                  </div>
                </div>

                <Link 
                  to={`/leader/${leaderId}`} 
                  state={{ from: "advisors" }}
                  className="text-[#D50032] font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1 group-hover:gap-2 transition-all w-full py-3.5 rounded-xl bg-gray-50 group-hover:bg-[#FFF0F2] mt-auto"
                >
                  Read Full Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
