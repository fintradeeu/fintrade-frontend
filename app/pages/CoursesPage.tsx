import { useState, useEffect } from "react";
import api from "../services/api";
import { CourseCard } from "./MarketingHome";
import CourseCheckoutModal from "../components/CourseCheckoutModal";
import { BookOpen, LineChart, Trophy } from "lucide-react";

export default function CoursesPage() {
  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<any>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        if (res.data && res.data.length > 0) {
          const detailed = await Promise.all(
            res.data.map(async (c: any) => {
              try {
                const det = await api.get(`/courses/${c.id}`);
                return det.data;
              } catch {
                return c;
              }
            })
          );
          setApiCourses(detailed);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex-1 bg-white font-sans relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D50032]/10 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D50032]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D50032]/5 border border-[#D50032]/10 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D50032] animate-pulse" />
              <span className="text-xs font-bold text-[#D50032] tracking-wide uppercase">Elite Trading Education</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] mb-4 tracking-tight leading-tight">
              Master the Markets with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D50032] to-[#FF0000]">
                Professional Programs
              </span>
            </h1>
            <p className="text-base text-gray-600 font-medium leading-relaxed max-w-xl mx-auto">
              Choose from our expertly crafted courses designed to take you from a beginner to an institutional-level trader. Real markets, real capital, real results.
            </p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apiCourses.map((c: any, i: number) => {
            const diff = (c.difficulty_level || "beginner").toLowerCase();
            const course = {
                ...c,
                name: c.title,
                level: diff.charAt(0).toUpperCase() + diff.slice(1),
                duration: c.duration_hours ? `${c.duration_hours} Days` : "Self-paced",
                originalPrice: c.original_price && Number(c.original_price) > 0 ? `₹${Number(c.original_price).toLocaleString("en-IN")}` : null,
                price: `₹${Number(c.price).toLocaleString("en-IN")}`,
                savings: c.original_price && Number(c.original_price) > Number(c.price) ? `₹${(Number(c.original_price) - Number(c.price)).toLocaleString("en-IN")}` : null,
                shortDescription: c.short_description || c.description || "Professional trading course",
                fullDescription: c.description || c.short_description || "Professional trading course.",
                icon: diff === "beginner" ? BookOpen : diff === "intermediate" ? LineChart : Trophy,
                modules: (c.modules || []).sort((a: any, b: any) => a.order - b.order),
            };
            return (
              <div key={i} className="flex-shrink-0 flex">
                <CourseCard course={course} onEnroll={() => setSelectedCourseForCheckout(course)} />
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {selectedCourseForCheckout && (
        <CourseCheckoutModal
          course={selectedCourseForCheckout}
          onClose={() => setSelectedCourseForCheckout(null)}
          onSuccess={() => {
            setSelectedCourseForCheckout(null);
            alert("Enrollment successful! You can now access your dashboard.");
            window.location.href = "/student/dashboard";
          }}
        />
      )}
    </div>
  );
}
