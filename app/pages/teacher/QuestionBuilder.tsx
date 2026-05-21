import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useParams, useNavigate, useLocation } from "react-router";
import { Plus, Trash, ArrowLeft, Save, Upload, FileSpreadsheet, Eye, X, Download, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../../services/api";

type QuestionData = {
  question_text: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  category: string;
  explanation: string;
  options: { option_text: string; is_correct: boolean }[];
};

export default function QuestionBuilder() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get("type") === "entrance" ? "entrance" : "course";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [examType] = useState<"entrance" | "course">(initialType);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "upload" | "manual">("existing");

  // --- File upload state ---
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<QuestionData[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Existing questions state ---
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);

  // --- Manual questions state ---
  const [manualExpanded, setManualExpanded] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      question_text: "",
      question_type: "mcq",
      marks: 1.0,
      negative_marks: 0.0,
      category: "",
      explanation: "",
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  // --- Manual Preview state ---
  const [isManualPreviewOpen, setIsManualPreviewOpen] = useState(false);

  // --- Load existing questions on mount ---
  const fetchExisting = () => {
    setLoadingExisting(true);
    const isCourse = examType !== "entrance";
    api.get(`/admin/exams/questions-list?exam_id=${examId}&is_course=${isCourse}`)
      .then(res => {
        setExistingQuestions(res.data || []);
      })
      .catch(() => setExistingQuestions([]))
      .finally(() => setLoadingExisting(false));
  };

  useEffect(() => {
    if (examId) fetchExisting();
  }, [examId, examType]);

  const handleDeleteExisting = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const isCourse = examType !== "entrance";
      await api.delete(`/admin/exams/questions/${id}?is_course=${isCourse}`);
      toast.success("Question deleted");
      fetchExisting();
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  const handleUpdateExisting = async () => {
    try {
      const isCourse = examType !== "entrance";
      await api.put(`/admin/exams/questions/${editingQuestionId}?is_course=${isCourse}`, editFormData);
      toast.success("Question updated");
      setEditingQuestionId(null);
      fetchExisting();
    } catch (err) {
      toast.error("Failed to update question");
    }
  };

  const startEditing = (q: any) => {
    setEditingQuestionId(q.id);
    setEditFormData(JSON.parse(JSON.stringify(q))); // deep copy
  };

  // ─── File upload handlers ─────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload a .csv, .xlsx, or .xls file");
      return;
    }
    setUploadedFile(file);
    setPreviewQuestions([]);
  };

  const handlePreview = async () => {
    if (!uploadedFile) return;
    setIsPreviewing(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const res = await api.post("/admin/exams/preview-upload", formData, {
        headers: { "Content-Type": undefined }
      });
      setPreviewQuestions(res.data.questions);
      toast.success(`Parsed ${res.data.count} questions from file`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to parse file");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      const isCourse = examType === "course";
      const res = await api.post(
        `/admin/exams/upload-questions?exam_id=${examId}&is_course_exam=${isCourse}`,
        formData,
        { headers: { "Content-Type": undefined } }
      );
      toast.success(res.data.message);
      navigate("/teacher/exams");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ') 
        : typeof detail === 'string' ? detail : "Failed to upload questions";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const header = "question,option_a,option_b,option_c,option_d,correct_answer,marks,negative_marks,category,explanation\n";
    const sample =
      '"What is a stop-loss order?","To maximize profits","To limit potential losses","To guarantee entry","To increase volume","b","1","0.25","Risk Management","A stop-loss limits downside risk."\n' +
      '"What does P/E ratio stand for?","Profit to Equity","Price to Earnings","Performance to Expectation","Portfolio to Exchange","b","1","0","Fundamental Analysis","Price-to-Earnings ratio is a valuation metric."';
    const blob = new Blob([header + sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Manual question handlers ─────────────────────────────────────
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "mcq",
        marks: 1.0,
        negative_marks: 0.0,
        category: "",
        explanation: "",
        options: [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false },
        ],
      },
    ]);
    setManualExpanded(questions.length);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (manualExpanded === index) setManualExpanded(null);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push({ option_text: "", is_correct: false });
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === "is_correct" && updated[qIndex].question_type === "mcq") {
      updated[qIndex].options.forEach((opt, i) => {
        opt.is_correct = i === optIndex ? value : false;
      });
    } else {
      updated[qIndex].options[optIndex] = { ...updated[qIndex].options[optIndex], [field]: value };
    }
    setQuestions(updated);
  };

  const handleSaveManual = async () => {
    const valid = questions.filter((q) => q.question_text.trim());
    if (valid.length === 0) {
      toast.warning("Add at least one question with text");
      return;
    }
    try {
      setIsSaving(true);
      const endpoint =
        examType === "course"
          ? `/admin/course-exams/questions?exam_id=${examId}`
          : `/admin/exams/questions?exam_id=${examId}`;
      await api.post(endpoint, valid);
      toast.success(`Saved ${valid.length} question(s) successfully!`);
      navigate("/teacher/exams");
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join(', ') 
        : typeof detail === 'string' ? detail : "Failed to save questions";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/teacher/exams")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#0B2A5B]">Question Builder</h1>
              <p className="text-sm text-[#0B2A5B]/60">
                Exam #{examId} · {examType === "entrance" ? "Entrance" : "Course"} Exam
              </p>
            </div>
          </div>
        </div>
        {/* Current Pool Status */}
        {!loadingExisting && existingQuestions.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200 border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Existing Question Pool</h3>
                <p className="text-sm text-blue-700">
                  There are currently <strong>{existingQuestions.length}</strong> questions in this exam's pool.
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Database Sync Active
            </Badge>
          </Card>
        )}

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-white border border-gray-200 p-1 shadow-sm overflow-x-auto">
          <button
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "existing"
                ? "bg-[#0B2A5B] text-white shadow-md"
                : "text-[#0B2A5B]/70 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("existing")}
          >
            <FileText size={18} />
            Existing Questions
          </button>
          <button
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-[#0B2A5B] text-white shadow-md"
                : "text-[#0B2A5B]/70 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={18} />
            Upload CSV / Excel
          </button>
          <button
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-[#0B2A5B] text-white shadow-md"
                : "text-[#0B2A5B]/70 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("manual")}
          >
            <Plus size={18} />
            Add Manually
          </button>
        </div>

        {/* ─── EXISTING TAB ──────────────────────────────────────────── */}
        {activeTab === "existing" && (
          <div className="space-y-4">
            {loadingExisting ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#0B2A5B]" size={32} /></div>
            ) : existingQuestions.length === 0 ? (
              <Card className="p-12 text-center text-[#0B2A5B]/60">
                No questions exist yet. Use Upload or Manual tab to add some.
              </Card>
            ) : (
              existingQuestions.map((q, idx) => {
                const isEditing = editingQuestionId === q.id;
                const data = isEditing ? editFormData : q;

                return (
                  <Card key={q.id} className="overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 border-b gap-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#0B2A5B]">Q{idx + 1}</Badge>
                        {!isEditing && (
                          <div className="flex gap-2">
                            <Badge className="bg-gray-200 text-gray-700">{q.question_type}</Badge>
                            <span className="text-sm font-medium text-[#0B2A5B]">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                            {q.negative_marks > 0 && <span className="text-sm text-red-500">(-{q.negative_marks})</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setEditingQuestionId(null)}>Cancel</Button>
                            <Button size="sm" className="bg-[#C2A86A] text-[#0B2A5B]" onClick={handleUpdateExisting}>Save Changes</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="text-[#0B2A5B]" onClick={() => startEditing(q)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteExisting(q.id)}>Delete</Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Textarea value={data.question_text} onChange={e => setEditFormData({...data, question_text: e.target.value})} />
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select value={data.question_type} onValueChange={v => setEditFormData({...data, question_type: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mcq">MCQ</SelectItem>
                                  <SelectItem value="true_false">True/False</SelectItem>
                                  <SelectItem value="descriptive">Descriptive</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Input value={data.category || ''} onChange={e => setEditFormData({...data, category: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Marks</Label>
                              <Input type="number" step="0.5" value={data.marks} onChange={e => setEditFormData({...data, marks: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Negative</Label>
                              <Input type="number" step="0.25" value={data.negative_marks} onChange={e => setEditFormData({...data, negative_marks: parseFloat(e.target.value)})} />
                            </div>
                          </div>

                          {data.question_type !== 'descriptive' && (
                            <div className="space-y-2 mt-4">
                              <Label>Options</Label>
                              {data.options.map((opt: any, optIdx: number) => (
                                <div key={optIdx} className="flex gap-2">
                                  <div className="flex items-center">
                                    <input type="radio" name={`edit-correct-${q.id}`} checked={opt.is_correct} 
                                      onChange={() => {
                                        const newOpts = [...data.options];
                                        newOpts.forEach(o => o.is_correct = false);
                                        newOpts[optIdx].is_correct = true;
                                        setEditFormData({...data, options: newOpts});
                                      }}
                                    />
                                  </div>
                                  <Input value={opt.option_text} onChange={e => {
                                    const newOpts = [...data.options];
                                    newOpts[optIdx].option_text = e.target.value;
                                    setEditFormData({...data, options: newOpts});
                                  }} />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label>Explanation</Label>
                            <Textarea value={data.explanation || ''} onChange={e => setEditFormData({...data, explanation: e.target.value})} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg text-[#0B2A5B] font-medium mb-4">{q.question_text}</p>
                          {q.question_type !== 'descriptive' && q.options && (
                            <div className="space-y-2 ml-4">
                              {q.options.map((opt: any, j: number) => (
                                <div key={j} className={`flex items-center gap-2 p-2 rounded text-sm ${opt.is_correct ? 'bg-green-50 border border-green-200' : 'border border-gray-100'}`}>
                                  {opt.is_correct ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} className="text-gray-300" />}
                                  <span className={opt.is_correct ? 'text-green-800 font-medium' : 'text-gray-600'}>{opt.option_text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {q.explanation && (
                            <p className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded">💡 {q.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* ─── UPLOAD TAB ──────────────────────────────────────────── */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            {/* Upload Area */}
            <Card className="p-8 border-2 border-dashed border-[#C2A86A]/40 bg-white">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#C2A86A]/10 flex items-center justify-center">
                  <FileSpreadsheet className="text-[#C2A86A]" size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0B2A5B]">
                    Upload Question Sheet
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with your questions.
                    The system will parse them and randomly assign to students.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    size="lg"
                    className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {uploadedFile ? "Change File" : "Select File"}
                  </Button>
                  <Button variant="outline" size="lg" onClick={downloadTemplate}>
                    <Download className="mr-2 h-5 w-5" />
                    Download Template
                  </Button>
                </div>

                {uploadedFile && (
                  <div className="inline-flex items-center gap-3 bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-medium mt-2">
                    <FileSpreadsheet size={16} />
                    {uploadedFile.name}
                    <button onClick={() => { setUploadedFile(null); setPreviewQuestions([]); }}>
                      <X size={16} className="hover:text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Expected format hint */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-[#0B2A5B]/80 mb-2 uppercase tracking-wider">
                  Expected Columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {["question", "option_a", "option_b", "option_c", "option_d", "correct_answer"].map((col) => (
                    <Badge key={col} className="bg-[#0B2A5B]/10 text-[#0B2A5B] font-mono text-xs">
                      {col}
                    </Badge>
                  ))}
                  {["marks", "negative_marks", "category", "explanation"].map((col) => (
                    <Badge key={col} variant="outline" className="text-gray-500 font-mono text-xs">
                      {col} <span className="text-[10px] ml-1">(optional)</span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>correct_answer</strong> should be one of: A, B, C, or D (matching the option columns).
                </p>
              </div>
            </Card>

            {/* Actions */}
            {uploadedFile && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePreview}
                  disabled={isPreviewing}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isPreviewing ? "Parsing..." : "Preview Questions"}
                </Button>
                <Button
                  className="flex-1 bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B] font-semibold"
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload & Save All"}
                </Button>
              </div>
            )}

            {/* Preview Table */}
            {previewQuestions.length > 0 && (
              <Card className="overflow-hidden shadow-md">
                <div className="bg-[#0B2A5B] text-white px-6 py-3 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Preview: {previewQuestions.length} Questions Parsed
                  </h3>
                  <Badge className="bg-green-500 text-white">Ready to Upload</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium w-10">#</th>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium">Question</th>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium w-20">Options</th>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium w-20">Correct</th>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium w-16">Marks</th>
                        <th className="text-left px-4 py-3 text-[#0B2A5B]/70 font-medium w-24">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewQuestions.map((q, idx) => {
                        const correctOpt = q.options.find((o) => o.is_correct);
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-[#0B2A5B]/60">{idx + 1}</td>
                            <td className="px-4 py-3 text-[#0B2A5B] max-w-md truncate">
                              {q.question_text}
                            </td>
                            <td className="px-4 py-3 text-[#0B2A5B]/60">{q.options.length}</td>
                            <td className="px-4 py-3 text-green-700 text-xs max-w-[120px] truncate">
                              {correctOpt?.option_text || "—"}
                            </td>
                            <td className="px-4 py-3 text-[#0B2A5B]">{q.marks}</td>
                            <td className="px-4 py-3">
                              {q.category ? (
                                <Badge variant="outline" className="text-xs">{q.category}</Badge>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ─── MANUAL TAB ──────────────────────────────────────────── */}
        {activeTab === "manual" && (
          <div className="space-y-4">
            {questions.map((q, qIndex) => {
              const isExpanded = manualExpanded === qIndex;
              return (
                <Card key={qIndex} className="overflow-hidden shadow-sm">
                  {/* Collapsed header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setManualExpanded(isExpanded ? null : qIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#0B2A5B]">Q{qIndex + 1}</Badge>
                      <span className="text-sm text-[#0B2A5B] font-medium truncate max-w-md">
                        {q.question_text || "New question..."}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {q.category && (
                        <Badge variant="outline" className="text-xs hidden md:inline-flex">{q.category}</Badge>
                      )}
                      <span className="text-xs text-gray-500">{q.marks} marks</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(qIndex); }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded form */}
                  {isExpanded && (
                    <div className="p-6 pt-2 border-t space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={q.question_type}
                            onValueChange={(val) => updateQuestion(qIndex, "question_type", val)}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True / False</SelectItem>
                              <SelectItem value="multi_select">Multi-Select</SelectItem>
                              <SelectItem value="descriptive">Descriptive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Category / Topic</Label>
                          <Input
                            placeholder="e.g. Technical Analysis"
                            value={q.category}
                            onChange={(e) => updateQuestion(qIndex, "category", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea
                          placeholder="Enter question text..."
                          value={q.question_text}
                          onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Marks</Label>
                          <Input
                            type="number" min="0" step="0.5"
                            value={q.marks}
                            onChange={(e) => updateQuestion(qIndex, "marks", parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Negative Marks</Label>
                          <Input
                            type="number" min="0" step="0.5"
                            value={q.negative_marks}
                            onChange={(e) => updateQuestion(qIndex, "negative_marks", parseFloat(e.target.value))}
                          />
                        </div>
                      </div>

                      {q.question_type !== "descriptive" && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-base">Options</Label>
                            {q.question_type !== "true_false" && (
                              <Button variant="outline" size="sm" onClick={() => handleAddOption(qIndex)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Option
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <input
                                  type={q.question_type === "mcq" || q.question_type === "true_false" ? "radio" : "checkbox"}
                                  name={`correct-${qIndex}`}
                                  checked={opt.is_correct}
                                  onChange={(e) => updateOption(qIndex, optIndex, "is_correct", e.target.checked)}
                                  className="w-5 h-5 accent-[#C2A86A]"
                                />
                                <Input
                                  value={opt.option_text}
                                  onChange={(e) => updateOption(qIndex, optIndex, "option_text", e.target.value)}
                                  placeholder={`Option ${optIndex + 1}`}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost" size="icon"
                                  className="text-gray-400 hover:text-red-500 h-8 w-8"
                                  onClick={() => handleRemoveOption(qIndex, optIndex)}
                                  disabled={q.options.length <= 2}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          placeholder="Explanation shown after attempt..."
                          className="h-20"
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}

            <Button
              variant="outline"
              className="w-full py-6 border-dashed border-2 text-gray-500 hover:text-[#0B2A5B] hover:border-[#0B2A5B]"
              onClick={handleAddQuestion}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Another Question
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="py-6 border-[#0B2A5B]/20 text-[#0B2A5B]"
                onClick={() => setIsManualPreviewOpen(true)}
              >
                <Eye className="mr-2 h-5 w-5" />
                Preview Exam
              </Button>
              <Button
                className="bg-[#C2A86A] hover:bg-[#C2A86A]/90 text-[#0B2A5B] font-semibold py-6 text-base"
                onClick={handleSaveManual}
                disabled={isSaving}
              >
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? "Saving..." : `Save ${questions.filter((q) => q.question_text.trim()).length} Question(s)`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Preview Modal */}
      <Dialog open={isManualPreviewOpen} onOpenChange={setIsManualPreviewOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview New Questions</DialogTitle>
            <DialogDescription>
              Review the questions you've added before saving them to the exam.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-2">
            {questions.filter(q => q.question_text.trim()).length === 0 ? (
              <p className="text-center text-[#0B2A5B]/60 py-8">Enter at least one question to preview.</p>
            ) : (
              questions.filter(q => q.question_text.trim()).map((q, i) => (
                <div key={i} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-[#0B2A5B] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-[#0B2A5B]">{q.question_text}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-gray-200 text-gray-600 text-xs">{q.question_type}</Badge>
                        <span className="text-xs text-[#0B2A5B]/50">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  {q.question_type !== "descriptive" && (
                    <div className="ml-10 space-y-1.5">
                      {q.options.map((opt, j) => (
                        <div key={j} className={`flex items-center gap-2 text-sm p-2 rounded ${opt.is_correct ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-100'}`}>
                          {opt.is_correct ? <CheckCircle size={14} className="text-green-600 flex-shrink-0" /> : <XCircle size={14} className="text-gray-300 flex-shrink-0" />}
                          <span className={opt.is_correct ? 'text-green-800 font-medium' : 'text-gray-700'}>{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
