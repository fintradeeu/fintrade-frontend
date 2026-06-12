import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Star, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, BookOpen, MessageSquare } from "lucide-react";
import api from "../services/api";

interface PublicFormInfo {
  id: number;
  title: string;
  description?: string;
  course: {
    id: number;
    title: string;
    description?: string;
    short_description?: string;
    thumbnail_url?: string;
  };
}

export default function SubmitFeedback() {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [formInfo, setFormInfo] = useState<PublicFormInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in to pre-fill
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.full_name) {
          setFullName(parsed.full_name);
          setEmail(parsed.email || "");
          setIsLoggedIn(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse user info", e);
    }
    

    const fetchFormInfo = async () => {
      if (!formId) return;
      try {
        const res = await api.get(`/feedback/forms/public/${formId}`);
        setFormInfo(res.data);
      } catch (err: any) {
        toast.error("Feedback form is not active or could not be found.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormInfo();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInfo) return;

    if (!rating) {
      toast.error("Please select a star rating.");
      return;
    }

    if (!fullName.trim() && !isLoggedIn) {
      toast.error("Please enter your name.");
      return;
    }

    if (!comments.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/feedback/submit", {
        form_id: formInfo.id,
        rating,
        comments,
        full_name: fullName.trim() || undefined,
        email: email.trim() || undefined,
      });
      setSuccess(true);
      toast.success("Feedback submitted successfully. Thank you!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-[#0B2A5B] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-semibold">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (!formInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <Card className="max-w-md w-full p-8 border border-slate-100 bg-white text-center shadow-lg rounded-2xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">Form Not Available</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            This feedback form may have been disabled by the administrator, or the URL might be invalid.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white font-bold w-full py-2.5 rounded-xl transition-all">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4">
        <Card className="max-w-lg w-full p-8 border border-slate-100 bg-white text-center shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#0B2A5B]/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#C2A86A]/10 rounded-full blur-2xl" />
          
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-[#0B2A5B] mb-2">Thank You!</h2>
          <p className="text-slate-700 text-base mb-4 font-medium">
            Your review for <span className="text-[#0B2A5B] font-semibold">"{formInfo.course.title}"</span> has been submitted successfully.
          </p>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Your feedback helps us continuously improve our curriculum and mentor experience. We truly appreciate your time and support.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#0B2A5B] hover:bg-[#1a3d7a] text-white font-bold px-8 py-2.5 rounded-xl transition-all">
            Return to FinTrade
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col justify-center">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#0B2A5B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#C2A86A]/5 rounded-full blur-3xl" />

      <div className="max-w-4xl w-full mx-auto relative z-10 grid md:grid-cols-5 gap-8">
        
        {/* Left Column: Course Details / Instructions */}
        <div className="md:col-span-2 flex flex-col justify-between text-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-[#0B2A5B] h-6 w-6" />
              <span className="font-bold text-lg tracking-wider text-[#0B2A5B] uppercase">FinTrade Academy</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-[#0B2A5B]">
              Share Your <span className="text-[#C2A86A]">Feedback</span>
            </h1>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              We're committed to delivering high-quality education. Please take a brief moment to rate your experience with this course.
            </p>

            {/* Course Card */}
            <Card className="border border-slate-100 bg-white p-5 shadow-lg relative overflow-hidden group rounded-2xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0B2A5B]" />
              
              {formInfo.course.thumbnail_url ? (
                <img 
                  src={formInfo.course.thumbnail_url} 
                  alt={formInfo.course.title}
                  className="w-full h-32 object-cover rounded-xl mb-4 border border-slate-100 group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-24 rounded-xl mb-4 bg-gradient-to-br from-[#0B2A5B] to-[#123e7f] flex items-center justify-center border border-slate-100">
                  <BookOpen className="h-10 w-10 text-white/80" />
                </div>
              )}

              <span className="text-[10px] font-bold text-[#0B2A5B] uppercase tracking-widest bg-[#0B2A5B]/10 px-2 py-0.5 rounded">
                Course Review
              </span>
              <h3 className="font-bold text-lg text-slate-800 mt-2 mb-1.5 line-clamp-1">{formInfo.course.title}</h3>
              <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                {formInfo.course.short_description || formInfo.course.description || "Learn advanced trading strategies and market analysis."}
              </p>
            </Card>
          </div>

          <div className="hidden md:block pt-8 border-t border-slate-200 mt-8 text-xs text-slate-400">
            © {new Date().getFullYear()} FinTrade. All rights reserved. | Powered by FT EDUTECH LLP | Safe and secure review collection.
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="md:col-span-3">
          <Card className="p-6 sm:p-8 border border-slate-100 bg-white shadow-xl rounded-2xl">
            <h2 className="text-xl font-bold text-[#0B2A5B] mb-1">{formInfo.title}</h2>
            {formInfo.description && (
              <p className="text-slate-500 text-xs mb-6 italic leading-relaxed">{formInfo.description}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Full Name */}
              <div>
                <Label htmlFor="fullname" className="text-slate-700 text-sm font-semibold mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoggedIn}
                  className="bg-white border-slate-300 text-slate-800 focus:border-[#0B2A5B] focus:ring-2 focus:ring-[#0B2A5B]/20 h-11 rounded-xl"
                  required
                />
                {isLoggedIn && (
                  <span className="text-[10px] text-[#0B2A5B] mt-1 block font-medium">Signed in account</span>
                )}
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="email" className="text-slate-700 text-sm font-semibold mb-1.5 block">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggedIn}
                  className="bg-white border-slate-300 text-slate-800 focus:border-[#0B2A5B] focus:ring-2 focus:ring-[#0B2A5B]/20 h-11 rounded-xl"
                />
              </div>

              {/* Star Rating Control */}
              <div>
                <Label className="text-slate-700 text-sm font-semibold mb-2 block">
                  Your Rating <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition-transform duration-150 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={`${
                            isActive 
                              ? "fill-[#f59e0b] text-[#f59e0b] filter drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" 
                              : "text-slate-300"
                          } transition-all duration-150`}
                        />
                      </button>
                    );
                  })}
                  {rating > 0 && (
                    <span className="ml-2 text-xs font-bold text-[#0B2A5B] bg-[#0B2A5B]/10 px-2 py-0.5 rounded">
                      {rating} {rating === 1 ? "Star" : "Stars"}
                    </span>
                  )}
                </div>
              </div>

              {/* Comments Textarea */}
              <div>
                <Label htmlFor="comments" className="text-slate-700 text-sm font-semibold mb-1.5 block">
                  Your Review / Comments <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="comments"
                  placeholder="Tell us what you liked about this course, topics covered, mentor guidance, or what could be improved..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-[#0B2A5B] focus:ring-2 focus:ring-[#0B2A5B]/20 placeholder-slate-400"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0B2A5B] hover:bg-[#153e7f] text-white font-extrabold text-sm h-11 shadow-lg shadow-[#0B2A5B]/15 transition-all duration-300 rounded-xl"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
