import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  TrendingUp,
  Award,
  Users,
  BookOpen,
  BarChart3,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { month: "Jan", value: 50000 },
  { month: "Feb", value: 52000 },
  { month: "Mar", value: 54500 },
  { month: "Apr", value: 53000 },
  { month: "May", value: 56000 },
  { month: "Jun", value: 58500 },
];

const stats = [
  { label: "Active Students", value: "12,450", icon: <Users size={24} /> },
  { label: "Success Rate", value: "94.3%", icon: <TrendingUp size={24} /> },
  { label: "Expert Mentors", value: "250+", icon: <Award size={24} /> },
  { label: "Trading Volume", value: "₹2.4Cr", icon: <BarChart3 size={24} /> },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Professional Trader",
    location: "Mumbai",
    text: "FinTrade transformed my understanding of markets. The simulator is incredibly realistic and helped me build confidence before trading with real capital.",
    rating: 5,
  },
  {
    name: "Aditi Mehta",
    role: "Investment Analyst",
    location: "Bengaluru",
    text: "The structured learning path and expert mentorship made all the difference. I went from complete beginner to managing a ₹50L portfolio in 6 months.",
    rating: 5,
  },
  {
    name: "Karan Patel",
    role: "Quantitative Trader",
    location: "Ahmedabad",
    text: "Best fintech education platform in India. The AI tutor and doubt sessions ensured I never felt stuck. Highly recommended for serious learners.",
    rating: 5,
  },
];

const features = [
  {
    title: "Structured Learning",
    description: "Comprehensive courses from basics to advanced trading strategies",
    icon: <BookOpen size={32} />,
  },
  {
    title: "Live Trading Simulator",
    description: "Practice with ₹5L virtual capital on real market data",
    icon: <BarChart3 size={32} />,
  },
  {
    title: "AI-Powered Support",
    description: "24/7 AI tutor and personalized learning recommendations",
    icon: <Shield size={32} />,
  },
  {
    title: "Placement Assistance",
    description: "Direct placement opportunities with leading trading firms",
    icon: <Award size={32} />,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F1EA] to-[#e8e4d9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B2A5B] text-[#F4F1EA] shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C2A86A] rounded-lg flex items-center justify-center">
              <span className="text-[#0B2A5B] font-bold text-lg">FT</span>
            </div>
            <h1 className="text-2xl font-bold">FinTrade</h1>
          </div>
          <Link to="/login">
            <Button className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/20">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-[#C2A86A]/20 text-[#0B2A5B] rounded-full mb-6">
              <span className="font-semibold">India's Premier Fintech Education Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B2A5B] mb-6 leading-tight">
              Master Trading.
              <br />
              <span className="text-[#C2A86A]">Build Wealth.</span>
            </h1>
            <p className="text-lg text-[#0B2A5B]/80 mb-8 leading-relaxed">
              Learn professional trading strategies through our structured LMS platform. From entrance exam to
              placement, we guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/student/entrance-exam">
                <Button
                  size="lg"
                  className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-xl shadow-[#0B2A5B]/20 w-full sm:w-auto"
                >
                  Start Entrance Exam
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/student/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#0B2A5B] text-[#0B2A5B] hover:bg-[#0B2A5B] hover:text-[#F4F1EA] w-full sm:w-auto"
                >
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>

          {/* Trading Chart Preview */}
          <Card className="p-6 bg-white shadow-2xl border-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0B2A5B]">NIFTY 50</h3>
                <p className="text-sm text-[#0B2A5B]/60">Live Market Preview</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#C2A86A]">₹58,500</p>
                <p className="text-sm text-green-600 flex items-center justify-end gap-1">
                  <TrendingUp size={14} />
                  +2.4%
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C2A86A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C2A86A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0B2A5B20" />
                <XAxis dataKey="month" stroke="#0B2A5B" style={{ fontSize: "12px" }} />
                <YAxis stroke="#0B2A5B" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #C2A86A",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C2A86A"
                  strokeWidth={3}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-white border-none shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#C2A86A]/10 rounded-full flex items-center justify-center mb-3 text-[#C2A86A]">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-[#0B2A5B] mb-1">{stat.value}</p>
                <p className="text-sm text-[#0B2A5B]/70">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B2A5B] mb-4">Why Choose FinTrade?</h2>
          <p className="text-lg text-[#0B2A5B]/70 max-w-2xl mx-auto">
            Complete ecosystem designed to transform beginners into professional traders
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-[#C2A86A] mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">{feature.title}</h3>
              <p className="text-[#0B2A5B]/70">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B2A5B] mb-4">Success Stories</h2>
          <p className="text-lg text-[#0B2A5B]/70">What our students say about us</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-white border-none shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-[#C2A86A] text-[#C2A86A]" />
                ))}
              </div>
              <p className="text-[#0B2A5B]/80 mb-4 leading-relaxed">{testimonial.text}</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#0B2A5B]/10">
                <div className="w-12 h-12 bg-[#C2A86A] rounded-full flex items-center justify-center">
                  <span className="text-[#0B2A5B] font-semibold">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#0B2A5B]">{testimonial.name}</p>
                  <p className="text-sm text-[#0B2A5B]/60">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] border-none shadow-2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Trading Journey?</h2>
            <p className="text-lg text-[#F4F1EA]/90 mb-8">
              Join thousands of successful traders who started with FinTrade
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/entrance-exam">
                <Button
                  size="lg"
                  className="bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg shadow-[#C2A86A]/30 w-full sm:w-auto"
                >
                  Start Entrance Exam
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#F4F1EA] text-[#F4F1EA] hover:bg-[#F4F1EA] hover:text-[#0B2A5B] w-full sm:w-auto"
                >
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B2A5B] text-[#F4F1EA] py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#C2A86A] rounded-lg flex items-center justify-center">
                  <span className="text-[#0B2A5B] font-bold text-lg">FT</span>
                </div>
                <h3 className="text-xl font-bold">FinTrade</h3>
              </div>
              <p className="text-[#F4F1EA]/70 text-sm">
                India's premier fintech education and trading platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Programs</h4>
              <ul className="space-y-2 text-sm text-[#F4F1EA]/70">
                <li>Basic Trading</li>
                <li>Intermediate Strategies</li>
                <li>Advanced Analytics</li>
                <li>Master Trader</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[#F4F1EA]/70">
                <li>Trading Simulator</li>
                <li>AI Tutor</li>
                <li>Live Lectures</li>
                <li>Placement Support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-[#F4F1EA]/70">
                <li>support@fintrade.com</li>
                <li>+91 92746 75947</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#F4F1EA]/10 pt-8 text-center text-sm text-[#F4F1EA]/70">
            <p>© 2026 FinTrade. All rights reserved. | Built for professional trading education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
