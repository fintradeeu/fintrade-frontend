import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Plus, Edit, X } from "lucide-react";
import api from "../../services/api";

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    short_description: "",
    price: 0,
    difficulty_level: "beginner",
    duration_hours: 0
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/courses", newCourse);
      setShowAddModal(false);
      setNewCourse({ title: "", description: "", short_description: "", price: 0, difficulty_level: "beginner", duration_hours: 0 });
      fetchCourses();
    } catch (err: any) {
      alert("Error creating course: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Course Management</h1>
            <p className="text-[#0B2A5B]/70">Manage your course catalog</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
            <Plus size={16} className="mr-2" />
            Add New Course
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-6 bg-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-2 bg-blue-100 text-blue-700">{course.level}</Badge>
                <h3 className="text-xl font-semibold text-[#0B2A5B]">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
              </div>
              <Badge className={course.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                {course.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#0B2A5B]/10">
              <div>
                <p className="text-xs text-[#0B2A5B]/60">Category</p>
                <p className="text-lg font-semibold text-[#0B2A5B]">{course.category}</p>
              </div>
              <div>
                <p className="text-xs text-[#0B2A5B]/60">Price</p>
                <p className="text-lg font-semibold text-[#C2A86A]">₹{course.base_price?.toLocaleString() || "0"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]">
                <Edit size={14} className="mr-2" />
                Edit Course
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input required value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  required
                  className="w-full p-2 border rounded mt-1 bg-gray-50"
                  rows={3}
                  value={newCourse.description} 
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Level</label>
                <select 
                  className="w-full p-2 border rounded mt-1 bg-gray-50"
                  value={newCourse.difficulty_level} 
                  onChange={(e) => setNewCourse({...newCourse, difficulty_level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (Hours)</label>
                <Input required type="number" min="0" value={newCourse.duration_hours} onChange={(e) => setNewCourse({...newCourse, duration_hours: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="text-sm font-medium">Base Price (₹)</label>
                <Input required type="number" min="0" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})} />
              </div>

              <Button type="submit" className="w-full bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]">
                Create Course
              </Button>
            </form>
          </Card>
        </div>
      )}

    </DashboardLayout>
  );
}
