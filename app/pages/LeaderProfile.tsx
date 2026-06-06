import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { leaders } from "../data/leaders";

export default function LeaderProfile() {
  const { id } = useParams();
  const leader = leaders.find((l) => l.id === id);

  if (!leader) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Leader Not Found</h1>
        <Link to="/about" className="text-[#D50032] font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to About Us
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen relative pt-24 pb-20 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/about" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D50032] transition-colors font-bold text-sm mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Team
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          {/* Big Image Section */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl relative group bg-gray-100 border border-gray-100">
              <img 
                src={leader.image} 
                alt={leader.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 border-2 border-white/20 rounded-[32px] pointer-events-none" />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 pt-4">
            <div className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full mb-6 border border-[#D50032]/25 bg-[#D50032]/5">
              <span className="text-[#D50032] font-black text-xs tracking-wider uppercase">
                {leader.role}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              {leader.name}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium mb-10">
              {leader.fullBio}
            </p>

            <div>
              <h3 className="font-black text-gray-900 mb-4 text-sm tracking-widest uppercase text-gray-400">Expertise & Achievements</h3>
              <div className="flex flex-wrap gap-3">
                {leader.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="px-4 py-2 rounded-full text-sm font-bold text-gray-700 bg-gray-50 border border-gray-100 shadow-sm">
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
