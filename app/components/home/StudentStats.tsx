import { useState, useEffect, useRef } from "react";
import { Users, TrendingUp, MapPin, Briefcase, GraduationCap, Clock } from "lucide-react";

const stats = [
  { icon: Users, value: 1200, suffix: "+", label: "Students Trained", color: "#D50032" },
  { icon: TrendingUp, value: 85, suffix: "%", label: "Placement Rate", color: "#D50032" },
  { icon: MapPin, value: 15, suffix: "+", label: "Cities Across India", color: "#D50032" },
  { icon: Briefcase, value: 30, suffix: "+", label: "Partner Firms", color: "#D50032" },
  { icon: GraduationCap, value: 78, suffix: "%", label: "Course Completion", color: "#D50032" },
  { icon: Clock, value: 9, suffix: " Mo", label: "Avg. Placement Time", color: "#D50032" },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let frame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, start]);

  return count;
}

function StatCard({ icon: Icon, value, suffix, label, delay, inView }: {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  delay: number;
  inView: boolean;
}) {
  const count = useCountUp(value, 2000, inView);

  return (
    <div
      className="text-center group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s ease-out ${delay}ms`,
      }}
    >
      <div
        className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full mb-2 md:mb-4 group-hover:scale-110 transition-transform"
        style={{ background: "rgba(213,0,50,0.1)" }}
      >
        <Icon className="h-5 w-5 md:h-8 md:w-8" style={{ color: "#D50032" }} />
      </div>
      <div className="text-xl sm:text-2xl md:text-[2.5rem] font-bold mb-1 md:mb-2" style={{ color: "#121212" }}>
        {count}{suffix}
      </div>
      <div className="text-[10px] sm:text-xs md:text-base text-gray-600 font-medium leading-tight">{label}</div>
    </div>
  );
}

export default function StudentStats() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 border border-[#D50032]/30" style={{ background: "rgba(213,0,50,0.08)" }}>
            <span className="text-[#D50032] font-semibold text-sm">📊 Our Impact</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: "#121212" }}>Numbers That Speak</h2>
          <p className="text-xl text-gray-600">Real results from real students</p>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={i * 100} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
