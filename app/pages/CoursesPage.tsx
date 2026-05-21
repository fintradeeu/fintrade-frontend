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
    <div className="flex-1 bg-[#F5F5F5] font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#0B2A5B] mb-6 tracking-tight">All Courses</h1>
          <p className="text-lg text-gray-600">Master the markets with our comprehensive trading programs.</p>
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
