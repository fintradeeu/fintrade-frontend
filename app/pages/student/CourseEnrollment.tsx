import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import api from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Home,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  BarChart3,
  Award,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  Clock,
  Users,
  Star,
  IndianRupee,
  Tag,
  LogOut,
} from "lucide-react";



// We will fetch courses from the API instead of hardcoding them.
type CourseType = {
  id: number;
  title: string;
  difficulty_level: string;
  duration_hours: number;
  price: number;
  description: string;
  rating?: number;
  students?: number;
  modules?: number;
  features?: string[];
};

export default function CourseEnrollment() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showEntranceModal, setShowEntranceModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "NetBanking">("UPI");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [entranceExams, setEntranceExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch enrolled course IDs
        let localEnrolledIds: number[] = [];
        try {
          const enrolledRes = await api.get("/courses/enrolled");
          localEnrolledIds = enrolledRes.data.map((e: any) => e.course_id);
          setEnrolledIds(localEnrolledIds);
          setIsEnrolled(localEnrolledIds.length > 0);
        } catch { 
          /* not logged in — show all */ 
          setIsEnrolled(false);
        }

        // Fetch entrance exams
        try {
          const examsRes = await api.get("/exams/all");
          setEntranceExams(examsRes.data.entrance_exams || []);
        } catch (err) {
          console.error("Failed to load exams", err);
        }

        const res = await api.get("/courses");
        const availableCourses = res.data; // Show all courses

        // Fetch detail for each to get real module count
        const detailed = await Promise.all(
          availableCourses.map(async (c: any) => {
            try {
              const detail = await api.get(`/courses/${c.id}`);
              const moduleCount = detail.data.modules?.length || 0;
              return {
                ...c,
                level: c.difficulty_level || "Beginner",
                duration: c.duration_hours ? `${c.duration_hours} hours` : "—",
                modules: moduleCount,
                features: c.marketing_highlights || [],
              };
            } catch {
              return {
                ...c,
                level: c.difficulty_level || "Beginner",
                duration: c.duration_hours ? `${c.duration_hours} hours` : "—",
                modules: 0,
                features: c.marketing_highlights || [],
              };
            }
          })
        );
        setCourses(detailed);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
  }, []);

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  const applyCoupon = async () => {
    if (!selectedCourse) return;
    try {
      const res = await api.post("/offers/apply", { code: couponCode, course_id: selectedCourse });
      setDiscount(res.data.discount_applied);
      setFinalPrice(res.data.discounted_price);
      setCouponMsg(res.data.message || "Coupon applied successfully!");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid coupon code");
      setCouponMsg("");
    }
  };

  const handleEnroll = (courseId: number) => {
    setSelectedCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    setFinalPrice(course ? course.price : 0);
    setDiscount(0);
    setCouponCode("");
    setCouponMsg("");
    setErrorMsg("");

    // Check if there is an entrance exam for this course
    const exam = entranceExams.find((e: any) => e.course_id === courseId);
    if (exam && exam.is_active) {
      const hasPassed = exam.attempts && exam.attempts.some((a: any) => a.passed);
      if (!hasPassed) {
        setShowEntranceModal(true);
        return;
      }
    }

    setShowPayment(true);
  };

  const completePayment = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      if (finalPrice > 0) {
        // Initiate Easebuzz Payment
        const res = await api.post("/payments/create", { course_id: selectedCourse });
        if (res.data && res.data.redirect_url) {
          window.location.href = res.data.redirect_url;
        }
      } else {
        // Free course or 100% discount
        await api.post(`/courses/${selectedCourse}/enroll`, { distributor_code: couponCode });
        toast.success("Enrollment successful! Welcome to the course.");
        setTimeout(() => {
          window.location.href = "/student/modules";
        }, 1500);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Payment initiation failed.";
      if (errMsg.toLowerCase().includes("entrance exam")) {
        setShowPayment(false);
        setShowEntranceModal(true);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Available Courses</h1>
            <p className="text-[#0B2A5B]/70">Choose your learning path and start your trading journey</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            {!isEnrolled && (
              <Button
                className="bg-white text-[#D50032] hover:bg-[#D50032]/10 border-2 border-[#D50032] shadow-lg"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                <LogOut size={16} className="mr-2" />
                Log Out
              </Button>
            )}
            <Button
              className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20 hidden sm:flex"
              onClick={() => { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
            >
              <GraduationCap size={16} className="mr-2" />
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#F4F1EA]"
              onClick={() => { toast("Brochure download will be available soon!"); }}
            >
              <FileText size={16} className="mr-2" />
              Download Brochure
            </Button>
          </div>
        </div>
      </div>

      {showEntranceModal ? (
        <Card className="max-w-xl mx-auto p-8 bg-white shadow-2xl text-center border-t-4 border-[#D50032]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="text-[#D50032]" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">Entrance Exam Required</h2>
          <p className="text-[#0B2A5B]/70 mb-8 text-lg">
            You must pass the entrance exam for <strong className="text-[#0B2A5B]">{selectedCourseData?.title}</strong> before you can enroll.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setShowEntranceModal(false)}
              variant="outline"
              className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#F4F1EA]"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => navigate(`/student/entrance-exam?course_id=${selectedCourse}`)}
              className="bg-[#D50032] text-white hover:bg-[#b00029] shadow-lg shadow-[#D50032]/20 px-8"
              size="lg"
            >
              Take Entrance Exam Now
            </Button>
          </div>
        </Card>
      ) : !showPayment ? (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge
                    className={`mb-2 ${
                      (course as any).level === "Beginner" || course.difficulty_level === "beginner"
                        ? "bg-green-100 text-green-700"
                        : (course as any).level === "Intermediate" || course.difficulty_level === "intermediate"
                        ? "bg-blue-100 text-blue-700"
                        : (course as any).level === "Advanced" || course.difficulty_level === "advanced"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-[#C2A86A] text-[#0B2A5B]"
                    }`}
                  >
                    {(course as any).level || course.difficulty_level}
                  </Badge>
                  <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">{course.title}</h3>
                </div>
                <div></div>
              </div>

              <p className="text-[#0B2A5B]/70 mb-4">{course.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#0B2A5B]/10">
                <div className="text-center">
                  <Clock className="text-[#C2A86A] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[#0B2A5B]/60">Duration</p>
                  <p className="text-sm font-semibold text-[#0B2A5B]">{course.duration}</p>
                </div>
                <div className="text-center">
                  <BookOpen className="text-[#C2A86A] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[#0B2A5B]/60">Modules</p>
                  <p className="text-sm font-semibold text-[#0B2A5B]">{course.modules}</p>
                </div>
                <div className="text-center">
                  <Users className="text-[#C2A86A] mx-auto mb-1" size={20} />
                  <p className="text-xs text-[#0B2A5B]/60">Level</p>
                  <p className="text-sm font-semibold text-[#0B2A5B] capitalize">{course.difficulty_level}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-[#0B2A5B] mb-2">What You'll Learn:</p>
                <ul className="space-y-2">
                  {course.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#0B2A5B]/80">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#0B2A5B]/10">
                <div>
                  <p className="text-sm text-[#0B2A5B]/60">Course Fee</p>
                  <div className="flex items-center gap-2">
                    {course.original_price > 0 && (
                      <p className="text-lg font-bold text-gray-400 line-through flex items-center">
                        <IndianRupee size={16} />
                        {course.original_price.toLocaleString("en-IN")}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-[#0B2A5B] flex items-center">
                      <IndianRupee size={20} />
                      {course.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {enrolledIds.includes(course.id) ? (
                  <Button
                    onClick={() => navigate("/student/modules")}
                    className="bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 font-bold"
                  >
                    Start Learning
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20 font-bold"
                  >
                    Enroll Now
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <GraduationCap className="text-[#C2A86A] mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-[#0B2A5B] mb-2">No Courses Available Yet</h3>
              <p className="text-[#0B2A5B]/60">Courses will appear here once they are published by our instructors. Check back soon!</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto p-8 bg-white shadow-xl">
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-6">Complete Your Enrollment</h2>

          <div className="bg-[#F4F1EA] rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-[#0B2A5B] mb-2">{selectedCourseData?.title}</h3>
            <p className="text-sm text-[#0B2A5B]/70 mb-4">{selectedCourseData?.description}</p>
            <div className="flex items-center gap-4 text-sm text-[#0B2A5B]/60">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {selectedCourseData?.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={14} />
                {selectedCourseData?.modules} Modules
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-[#0B2A5B] mb-2 block">
                Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
                <Button
                  onClick={applyCoupon}
                  variant="outline"
                  className="border-[#0B2A5B]/20 text-[#0B2A5B]"
                >
                  <Tag size={16} className="mr-2" />
                  Apply
                </Button>
              </div>
              {errorMsg && (
                <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
              )}
              {couponMsg && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {couponMsg}
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#F4F1EA] rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[#0B2A5B]">
                <span>Course Fee</span>
                <span className="font-semibold">₹{selectedCourseData?.price.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-semibold">
                    -₹{discount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              <div className="border-t border-[#0B2A5B]/10 pt-3 flex justify-between text-[#0B2A5B]">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-[#C2A86A]">
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B2A5B]">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {["UPI", "Card", "NetBanking"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method as any)}
                  className={`p-4 border-2 rounded-lg font-semibold transition-colors ${paymentMethod === method ? "border-[#C2A86A] bg-[#C2A86A]/10 text-[#0B2A5B]" : "border-[#0B2A5B]/20 text-[#0B2A5B] hover:bg-[#F4F1EA]"}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={completePayment}
              disabled={loading}
              className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg shadow-[#0B2A5B]/20"
              size="lg"
            >
              {loading ? "Processing..." : `Pay ₹${finalPrice.toLocaleString("en-IN")}`}
            </Button>
            <Button
              onClick={() => setShowPayment(false)}
              variant="outline"
              className="border-2 border-[#0B2A5B]/20 text-[#0B2A5B]"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
