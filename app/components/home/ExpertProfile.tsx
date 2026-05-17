import { Award, BookOpen, Users, TrendingUp, ExternalLink } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface Expert {
  name: string;
  title: string;
  bio: string;
  photo: string;
  linkedIn: string;
  achievements: { icon: typeof Award; label: string; value: string }[];
}

const experts: Expert[] = [
  {
    name: "Rajesh Mehta",
    title: "Founder & Lead Trading Mentor",
    bio: "With over 15 years of experience in Indian equity and derivatives markets, Rajesh has trained 1000+ traders and managed institutional portfolios worth ₹500 Cr. He holds certifications from NISM and is a registered Research Analyst with SEBI.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    linkedIn: "https://www.linkedin.com/in/",
    achievements: [
      { icon: TrendingUp, label: "Trading Experience", value: "15+ Years" },
      { icon: Users, label: "Students Mentored", value: "1000+" },
      { icon: BookOpen, label: "Courses Created", value: "12" },
      { icon: Award, label: "SEBI Registered", value: "RA" },
    ],
  },
];

function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Card className="overflow-hidden border-2 border-gray-100 hover:border-[#E53935] transition-all hover:shadow-2xl">
      <div className="grid md:grid-cols-5 gap-0">
        {/* Photo Side */}
        <div className="md:col-span-2 relative">
          <div className="h-full min-h-[300px] md:min-h-[400px] relative overflow-hidden">
            <img
              src={expert.photo}
              alt={expert.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,18,18,0.6) 0%, transparent 50%)" }} />
            <div className="absolute bottom-4 left-4 right-4">
              <a
                href={expert.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: "#0A66C2" }}
              >
                <span className="font-bold">in</span>
                Connect on LinkedIn
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Info Side */}
        <div className="md:col-span-3 p-8 flex flex-col justify-center bg-white">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 self-start" style={{ background: "rgba(229,57,53,0.1)", color: "#E53935" }}>
            Lead Expert
          </div>
          <h3 className="text-3xl font-bold mb-2" style={{ color: "#121212" }}>{expert.name}</h3>
          <p className="text-lg font-medium mb-4" style={{ color: "#E53935" }}>{expert.title}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{expert.bio}</p>

          {/* Achievement Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {expert.achievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(229,57,53,0.05)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(229,57,53,0.1)" }}>
                  <ach.icon className="h-5 w-5" style={{ color: "#E53935" }} />
                </div>
                <div>
                  <div className="text-lg font-bold" style={{ color: "#121212" }}>{ach.value}</div>
                  <div className="text-xs text-gray-500">{ach.label}</div>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="self-start shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-[#E53935] to-[#b71c1c] text-white hover:from-[#b71c1c] hover:to-[#b71c1c] transition-all duration-300"
            style={{ boxShadow: "0 4px 20px rgba(229,57,53,0.4)" }}
          >
            View Full Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ExpertProfile() {
  return (
    <section className="py-20 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#E53935]/30" style={{ background: "rgba(229,57,53,0.08)" }}>
            <span className="text-[#E53935] font-semibold text-sm">👨‍🏫 Meet the Expert</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Learn From the Best</h2>
          <p className="text-xl text-gray-600">Industry veterans guiding your trading journey</p>
        </div>
        <div className="space-y-8">
          {experts.map((expert, i) => (
            <ExpertCard key={i} expert={expert} />
          ))}
        </div>
      </div>
    </section>
  );
}
