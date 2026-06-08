import { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { CourseCard } from "./MarketingHome"; // reuse existing CourseCard component
import { motion } from "motion/react";

// New page to display all courses
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
    <div className="flex-1 bg-white font-sans relative overflow-hidden">
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
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-6 justify-center"
        >
          {apiCourses.length > 0 ? (
            apiCourses.map((c: any, i: number) => (
              <motion.div
                key={c.id || i}
                variants={{
                  hidden: { opacity: 0, y: 25, scale: 0.96 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 90,
                      damping: 14,
                    },
                  },
                }}
                className="flex"
              >
                <CourseCard course={c} />
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">Loading courses…</p>
          )}
        </motion.div>
      </section>
    </div>
  );
}
