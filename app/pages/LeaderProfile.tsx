import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
  if (leader.name) {
    return leader.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
  }
  if (leader.id) return leader.id;
  return "";
};

const getInitials = (name?: string) => {
  if (!name) return "FT";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const truncateText = (text: string, limit: number) => {
  if (!text || text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
};

export default function LeaderProfile() {
  const { id } = useParams();
  const location = useLocation();
  const [leader, setLeader] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLeadership, setIsLeadership] = useState(() => {
    return location.state?.from === "leadership";
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [id]);

  useEffect(() => {
    Promise.all([
      api.get("/settings/landing-page").catch(() => null),
      api.get("/settings/advisors").catch(() => null)
    ]).then(([landingRes, advisorsRes]) => {
      const leadersList = landingRes?.data?.leadership || [];
      const advisorsList = advisorsRes?.data?.advisors || [];

      const isLeader = leadersList.some((l: any) => getLeaderId(l) === id);
      const isAdvisor = advisorsList.some((l: any) => getLeaderId(l) === id);

      const combined = [...leadersList, ...advisorsList];

      let found: any = combined.find((l: any) => getLeaderId(l) === id);
      const staticFound = staticLeaders.find((l) => getLeaderId(l) === id) as any;

      if (!found) {
        found = staticFound;
      }

      if (found) {
        const imagePath = found.profile_image || found.image || (staticFound && (staticFound.profile_image || staticFound.image));
        const imageUrl = imagePath 
          ? getImageUrl(imagePath) 
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name || found.monogram || "FT")}&background=FFF0F2&color=D50032&size=512&font-size=0.33&bold=true`;

        const rawTags = found.tags || (staticFound && staticFound.tags) || [];
        const parsedTags = Array.isArray(rawTags)
          ? rawTags
          : typeof rawTags === "string"
            ? rawTags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        let resolvedIsLeadership = false;
        if (location.state?.from) {
          resolvedIsLeadership = location.state.from === "leadership";
        } else {
          if (isLeader) {
            resolvedIsLeadership = true;
          } else if (isAdvisor) {
            resolvedIsLeadership = false;
          } else if (staticFound) {
            resolvedIsLeadership = true;
          }
        }
        setIsLeadership(resolvedIsLeadership);

        const resolvedBio = resolvedIsLeadership
          ? (found.bio || found.fullBio || (staticFound && (staticFound.bio || staticFound.fullBio)) || "")
          : (found.fullBio || found.bio || (staticFound && (staticFound.fullBio || staticFound.bio)) || "");

        setLeader({
          ...(staticFound || {}),
          ...found,
          id: getLeaderId(found),
          role: found.role || found.title || (staticFound && (staticFound.role || staticFound.title)) || "Leadership",
          image: imageUrl,
          fullBio: resolvedBio,
          tags: parsedTags,
          initials: found.initials || (staticFound && staticFound.initials) || getInitials(found.name)
        });
      }
    })
    .catch((err) => {
      console.error("Failed to fetch leaders dynamically", err);
      const found = staticLeaders.find((l) => getLeaderId(l) === id) as any;
      if (found) {
        let resolvedIsLeadership = false;
        if (location.state?.from) {
          resolvedIsLeadership = location.state.from === "leadership";
        } else {
          resolvedIsLeadership = true;
        }
        setIsLeadership(resolvedIsLeadership);

        const resolvedBio = resolvedIsLeadership
          ? (found.bio || found.fullBio || "")
          : (found.fullBio || found.bio || "");

        setLeader({
          ...found,
          id: getLeaderId(found),
          role: found.role || found.title || "Leadership",
          image: found.image || "",
          fullBio: resolvedBio,
          tags: Array.isArray(found.tags) ? found.tags : [],
          initials: found.initials || getInitials(found.name)
        });
      }
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#D50032]/20 border-t-[#D50032] animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Leader Not Found</h1>
        <Link to={isLeadership ? "/about#leadership" : "/our-advisors"} className="text-[#D50032] font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to {isLeadership ? "Leadership" : "Advisors"}
        </Link>
      </div>
    );
  }

  const isMonogram = !leader.profile_image && (!leader.image || leader.image.includes("ui-avatars.com"));

  return (
    <div className="bg-white min-h-screen relative pt-24 pb-20 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={isLeadership ? "/about#leadership" : "/our-advisors"} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D50032] transition-colors font-bold text-sm mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {isLeadership ? "Leadership" : "Advisors"}
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          {/* Big Image/Monogram Section */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            {isMonogram ? (
              <div className="w-full aspect-square rounded-[32px] bg-[#FFF0F2] flex items-center justify-center shadow-lg relative border border-[#D50032]/5 select-none">
                <span className="text-[#D50032] font-semibold text-[8rem] sm:text-[10rem] md:text-[6rem] lg:text-[8rem] xl:text-[10rem] leading-none tracking-tight">
                  {leader.initials || "FT"}
                </span>
              </div>
            ) : (
              <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl relative group bg-gray-100 border border-gray-100">
                <img 
                  src={leader.image} 
                  alt={leader.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 border-2 border-white/20 rounded-[32px] pointer-events-none" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 pt-4">
            <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-6 border border-[#D50032]/25 bg-[#D50032]/5">
              <span className="text-[#D50032] font-bold text-xs tracking-wider uppercase">
                {leader.role}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0B2A5B] mb-6 tracking-tight">
              {leader.name}
            </h1>

            {(() => {
              const limit = 350;
              const shouldTruncate = leader.fullBio && leader.fullBio.length > limit;
              const displayBio = shouldTruncate && !isExpanded
                ? truncateText(leader.fullBio, limit)
                : leader.fullBio;

              return (
                <>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium mb-4 whitespace-pre-line">
                    {displayBio}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[#D50032] hover:text-[#b3002a] font-bold inline-flex items-center gap-1 transition-colors text-base mb-8 focus:outline-none group animate-fadeIn"
                    >
                      {isExpanded ? (
                        <>
                          Read Less <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                        </>
                      )}
                    </button>
                  )}
                </>
              );
            })()}

            <div>
              <h3 className="font-extrabold text-slate-800 mb-4 text-xs tracking-wider uppercase">
                Expertise & Achievements
              </h3>
              <div className="flex flex-wrap gap-3">
                {leader.tags.map((tag: string, tIdx: number) => (
                  <span key={tIdx} className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
