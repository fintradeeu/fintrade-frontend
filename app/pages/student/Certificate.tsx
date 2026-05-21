import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function Certificate() {
  const [userName, setUserName] = useState("Student");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserName(JSON.parse(stored).full_name || "Student");

    Promise.all([
      api.get("/certificates").then((r) => setCertificates(r.data)).catch(() => []),
      api.get("/courses/enrolled").then((r) => setEnrollments(r.data)).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  const completedCourses = enrollments.filter((e) => e.progress_percent >= 100);
  const totalModules = enrollments.reduce(
    (acc, e) => acc + (e.course?.modules?.length || 0), 0
  );

  const handleDownload = async (certId: number) => {
    try {
      const res = await api.get(`/certificates/download/${certId}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${certId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Download failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleGenerateCertificate = async (courseId: number) => {
    try {
      const res = await api.post("/certificates/generate", { course_id: courseId });
      setCertificates((prev) => [...prev, res.data]);
      alert("Certificate generated successfully!");
    } catch (err: any) {
      alert("Failed: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12 text-[#0B2A5B]/60">Loading certificates...</div>
      </DashboardLayout>
    );
  }

  const activeCert = certificates.length > 0 ? certificates[0] : null;

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Certificates</h1>
        <p className="text-[#0B2A5B]/70">Your earned certificates and achievements</p>
      </div>

      <div className="max-w-5xl mx-auto">
        {certificates.length > 0 ? (
          <>
            {/* Active Certificate Preview */}
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
                <h3 className="text-5xl font-bold text-[#0B2A5B]">{userName}</h3>
                <p className="text-lg text-[#0B2A5B]/70">has successfully completed the course</p>
                <h4 className="text-3xl font-semibold text-[#C2A86A]">
                  {activeCert.course_title || "Course"}
                </h4>
                {activeCert.grade && (
                  <div className="inline-block px-6 py-3 bg-[#C2A86A] text-[#0B2A5B] rounded-full">
                    <span className="text-xl font-bold">Grade: {activeCert.grade}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-8 border-t-2 border-[#0B2A5B]/10">
                <div className="text-center">
                  <div className="w-48 border-b-2 border-[#0B2A5B] mb-2"></div>
                  <p className="text-sm text-[#0B2A5B]/70">Date of Completion</p>
                  <p className="font-semibold text-[#0B2A5B]">
                    {activeCert.issued_at ? new Date(activeCert.issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div>
                  <div className="w-20 h-20 bg-[#C2A86A] rounded-full flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold text-[#0B2A5B]">FT</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b-2 border-[#0B2A5B] mb-2"></div>
                  <p className="text-sm text-[#0B2A5B]/70">Certificate ID</p>
                  <p className="font-semibold text-[#0B2A5B]">{activeCert.certificate_number || `FT-${activeCert.id}`}</p>
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
                onClick={() => handleDownload(activeCert.id)}
                size="lg"
                className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] shadow-lg"
              >
                <Download size={20} className="mr-2" />
                Download Certificate (PDF)
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Certificate link copied to clipboard!");
                }}
                size="lg"
                variant="outline"
                className="flex-1 border-2 border-[#C2A86A] text-[#C2A86A] hover:bg-[#C2A86A]/10"
              >
                <Share2 size={20} className="mr-2" />
                Share Certificate
              </Button>
            </div>

            {/* All Certificates List */}
            {certificates.length > 1 && (
              <Card className="p-6 bg-white shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-[#0B2A5B] mb-4">All Certificates</h3>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 bg-[#F4F1EA] rounded-lg">
                      <div>
                        <p className="font-semibold text-[#0B2A5B]">{cert.course_title || "Course"}</p>
                        <p className="text-xs text-[#0B2A5B]/60">
                          Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}
                          {cert.grade && ` • Grade: ${cert.grade}`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDownload(cert.id)} className="border-[#0B2A5B]/20">
                        <Download size={14} className="mr-1" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-12 bg-white shadow-lg text-center mb-6">
            <AlertCircle className="mx-auto text-[#C2A86A] mb-4" size={64} />
            <h2 className="text-2xl font-bold text-[#0B2A5B] mb-4">No Certificates Yet</h2>
            <p className="text-[#0B2A5B]/70 mb-6 max-w-md mx-auto">
              Complete a course to earn your certificate. You have {completedCourses.length} completed course(s).
            </p>
            {completedCourses.length > 0 && (
              <div className="space-y-3">
                {completedCourses.map((e) => (
                  <Button
                    key={e.course_id}
                    onClick={() => handleGenerateCertificate(e.course_id)}
                    className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a] mr-3"
                  >
                    Generate Certificate: {e.course?.title || `Course #${e.course_id}`}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Achievements */}
        <Card className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-xl">
          <h3 className="text-xl font-semibold mb-4">Your Achievements</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Courses Completed</p>
                <p className="text-lg font-semibold">{completedCourses.length}/{enrollments.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Certificates Earned</p>
                <p className="text-lg font-semibold">{certificates.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#C2A86A]" size={24} />
              <div>
                <p className="text-sm text-[#F4F1EA]/80">Avg Progress</p>
                <p className="text-lg font-semibold">
                  {enrollments.length > 0
                    ? Math.round(enrollments.reduce((s: number, e: any) => s + (e.progress_percent || 0), 0) / enrollments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
