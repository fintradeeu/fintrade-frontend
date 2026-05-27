import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import MarketingLayout from "../components/MarketingLayout";
import { CourseCard } from "../components/MarketingHome"; // reuse existing CourseCard component

// New page to display all courses with the same premium styling as MarketingLayout
export default function Courses() {
  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchFeatured = async () => {
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
    fetchFeatured();
  }, []);

  return (
    <MarketingLayout>
      {/* SEO Title */}
      <title>All Courses – FinTrade</title>
      <meta name="description" content="Explore all FinTrade professional programs and enroll in the course that fits your trading journey." />

      <section className="py-8 max-w-7xl mx-auto" id="courses">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#121212" }}>All Courses</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Browse the complete catalog of FinTrade programs – from fundamentals to advanced professional certifications.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 justify-center">
          {apiCourses.length > 0 ? (
            apiCourses.map((c: any) => (
              <CourseCard key={c.id} course={c} />
            ))
          ) : (
            <p className="text-gray-500">Loading courses…</p>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
