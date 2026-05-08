import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Award,
  Download,
  Share2,
  CheckCircle,
} from "lucide-react";



import { useState, useEffect } from "react";



export default function Certificate() {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserName(JSON.parse(stored).full_name || "Student");
  }, []);

  const certificateData = {
    studentName: userName,
    course: "Professional Trading Fundamentals",
    completionDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    certificateId: `FT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    finalScore: "—",
    grade: "—",
  };

  const handleDownload = () => {
    alert("Downloading certificate as PDF...");
  };

  const handleShare = () => {
    alert("Sharing on LinkedIn...");
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Certificate</h1>
        <p className="text-[#0B2A5B]/70">Congratulations on completing your course!</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Certificate Preview */}
        <Card className="p-12 bg-white shadow-2xl mb-6 border-8 border-[#C2A86A]">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-[#C2A86A]/10 rounded-full mb-4">
              <Award className="text-[#C2A86A]" size={64} />
            </div>
            <h2 className="text-4xl font-bold text-[#0B2A5B] mb-2">Certificate of Completion</h2>
            <div className="w-32 h-1 bg-[#C2A86A] mx-auto mb-6"></div>
          </div>

          <div className="text-center space-y-6 mb-8">
            <p className="text-lg text-[#0B2A5B]/70">This is to certify that</p>
            <h3 className="text-5xl font-bold text-[#0B2A5B]">{certificateData.studentName}</h3>
            <p className="text-lg text-[#0B2A5B]/70">has successfully completed the course</p>
            <h4 className="text-3xl font-semibold text-[#C2A86A]">{certificateData.course}</h4>
            <p className="text-lg text-[#0B2A5B]/70">
              with a final score of <span className="font-bold text-[#0B2A5B]">{certificateData.finalScore}</span>
            </p>
            <div className="inline-block px-6 py-3 bg-[#C2A86A] text-[#0B2A5B] rounded-full">
              <span className="text-xl font-bold">Grade: {certificateData.grade}</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-8 border-t-2 border-[#0B2A5B]/10">
            <div className="text-center">
              <div className="w-48 border-b-2 border-[#0B2A5B] mb-2"></div>
              <p className="text-sm text-[#0B2A5B]/70">Date of Completion</p>
              <p className="font-semibold text-[#0B2A5B]">{certificateData.completionDate}</p>
            </div>
            <div>
              <div className="w-20 h-20 bg-[#C2A86A] rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl font-bold text-[#0B2A5B]">FT</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-48 border-b-2 border-[#0B2A5B] mb-2"></div>
              <p className="text-sm text-[#0B2A5B]/70">Certificate ID</p>
              <p className="font-semibold text-[#0B2A5B]">{certificateData.certificateId}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-[#0B2A5B]/60 text-sm">
              <div className="w-16 h-16 bg-[#0B2A5B] rounded-lg flex items-center justify-center text-[#F4F1EA] font-bold text-lg">
                FT
              </div>
              <div className="text-left">
                <p className="font-bold text-[#0B2A5B]">FinTrade Education Platform</p>
                <p className="text-xs">India's Premier Fintech Learning Platform</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleDownload}
            size="lg"
            className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg"
          >
            <Download size={20} className="mr-2" />
            Download Certificate (PDF)
          </Button>
          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
            className="flex-1 border-2 border-[#C2A86A] text-[#C2A86A] hover:bg-[#C2A86A]/10"
          >
            <Share2 size={20} className="mr-2" />
            Share on LinkedIn
          </Button>
        </div>

        {/* Achievements */}
        <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Course Achievements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Modules Completed</p>
                <p className="text-lg font-semibold">5/5</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Exams Passed</p>
                <p className="text-lg font-semibold">3/3</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Study Hours</p>
                <p className="text-lg font-semibold">59 hours</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
