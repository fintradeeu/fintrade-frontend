import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Edit, Trash2, Video, Newspaper, Info, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";
import { useNavigate } from "react-router";

export default function AdminNews() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("news");
  
  // CMS Content State
  const [cmsContent, setCmsContent] = useState({
    about_us: "",
    contact_email: "",
    contact_phone: "",
    address: ""
  });

  const [newsList, setNewsList] = useState<any[]>([]);

  // Form State for News/Blog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "Market Update",
    description: "",
    video_url: "",
    thumbnail_url: "",
    status: "published"
  });

  useEffect(() => {
    fetchNews();
    fetchSettings();
  }, []);

  const fetchNews = async () => {
    try {
      if (!localStorage.getItem("token")) {
        navigate("/login");
        return;
      }
      const res = await api.get("/admin/news");
      setNewsList(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login as admin again");
        navigate("/login");
        return;
      }
      if (err.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/");
        return;
      }
      toast.error("Failed to fetch news/blogs");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      const general = res.data.general || [];
      const newCms: any = { ...cmsContent };
      general.forEach((s: any) => {
        if (s.key in newCms) newCms[s.key] = s.value || "";
      });
      setCmsContent(newCms);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateCms = async () => {
    try {
      await api.put("/admin/settings", { settings: cmsContent });
      toast.success("CMS updated successfully");
    } catch (err: any) {
      toast.error("Failed to update CMS");
    }
  };

  const handleOpenModal = (item?: any, type: "news" | "blog" = "news") => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.id);
      setFormData({
        title: item.title,
        type: item.type || (type === "news" ? "Market Update" : "Blog Story"),
        description: item.description || "",
        video_url: item.video_url || "",
        thumbnail_url: item.thumbnail_url || "",
        status: item.status
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        type: type === "news" ? "Market Update" : "Blog Story",
        description: "",
        video_url: "",
        thumbnail_url: "",
        status: "published"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmitNews = async () => {
    if (!formData.title) return toast.error("Title is required");
    try {
      const payload = {
        ...formData,
        video_url: formData.type === "Market Update" ? formData.video_url : ""
      };
      if (isEditing && currentId) {
        await api.put(`/admin/news/${currentId}`, payload);
        toast.success("Updated successfully");
      } else {
        await api.post("/admin/news", payload);
        toast.success("Created successfully");
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save");
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/news/${id}`);
      toast.success("Deleted successfully");
      fetchNews();
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  // Split data
  const marketUpdates = newsList.filter(n => (n.type || (n.video_url ? "Market Update" : "Blog Story")) === "Market Update");
  const blogStories = newsList.filter(n => (n.type || (n.video_url ? "Market Update" : "Blog Story")) === "Blog Story");

  const renderTable = (data: any[], type: "news" | "blog") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          {type === "news" && <TableHead>Video URL</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.title}</TableCell>
            {type === "news" && (
              <TableCell className="text-blue-500 max-w-[200px] truncate">
                <a href={item.video_url} target="_blank" rel="noreferrer">{item.video_url}</a>
              </TableCell>
            )}
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {item.status}
              </span>
            </TableCell>
            <TableCell>{item.views_count}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item, type)}>
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(item.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-gray-500">No records found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2A5B]">Blog & CMS Manager</h1>
          <p className="text-gray-600 mt-1">Manage website content, blogs, and market updates</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#F4F1EA] p-1 rounded-xl">
          <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white">
            <Video className="w-4 h-4 mr-2" /> Market Updates
          </TabsTrigger>
          <TabsTrigger value="blog" className="rounded-lg data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white">
            <Newspaper className="w-4 h-4 mr-2" /> Blog Stories
          </TabsTrigger>
          <TabsTrigger value="cms" className="rounded-lg data-[state=active]:bg-[#0B2A5B] data-[state=active]:text-white">
            <Info className="w-4 h-4 mr-2" /> CMS (About/Contact)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0B2A5B]">Market Analysis & Videos</h3>
              <Button onClick={() => handleOpenModal(null, "news")} className="bg-[#D50032] text-white hover:bg-[#b00028]">
                <Plus className="w-4 h-4 mr-2" /> Add Update
              </Button>
            </div>
            {renderTable(marketUpdates, "news")}
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0B2A5B]">Blog Management</h3>
              <Button onClick={() => handleOpenModal(null, "blog")} className="bg-[#D50032] text-white hover:bg-[#b00028]">
                <Plus className="w-4 h-4 mr-2" /> New Blog
              </Button>
            </div>
            {renderTable(blogStories, "blog")}
          </Card>
        </TabsContent>

        <TabsContent value="cms" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0B2A5B]">About Us Content</h3>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Main Description</Label>
                  <Textarea 
                    rows={6} 
                    value={cmsContent.about_us} 
                    onChange={e => setCmsContent({...cmsContent, about_us: e.target.value})}
                    className="bg-[#F4F1EA] border-gray-200"
                  />
                </div>
                <Button onClick={handleUpdateCms} className="bg-[#0B2A5B] text-white w-full hover:bg-[#1a3d7a]">Update About Content</Button>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <PhoneCall size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0B2A5B]">Contact Information</h3>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Support Email</Label>
                  <Input value={cmsContent.contact_email} onChange={e => setCmsContent({...cmsContent, contact_email: e.target.value})} className="bg-[#F4F1EA]" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input value={cmsContent.contact_phone} onChange={e => setCmsContent({...cmsContent, contact_phone: e.target.value})} className="bg-[#F4F1EA]" />
                </div>
                <div className="grid gap-2">
                  <Label>Physical Address</Label>
                  <Textarea value={cmsContent.address} onChange={e => setCmsContent({...cmsContent, address: e.target.value})} className="bg-[#F4F1EA]" rows={2} />
                </div>
                <Button onClick={handleUpdateCms} className="bg-[#0B2A5B] text-white w-full hover:bg-[#1a3d7a]">Save Contact Details</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#0B2A5B]">{isEditing ? "Edit Article" : "Create New Article"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="Article title..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Market Update">Market Update</option>
                <option value="Blog Story">Blog Story</option>
              </select>
            </div>
            
            {formData.type === "Market Update" && (
              <div className="grid gap-2">
                <Label>YouTube Video URL</Label>
                <Input 
                  value={formData.video_url} 
                  onChange={e => setFormData({...formData, video_url: e.target.value})} 
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Thumbnail URL (Optional)</Label>
              <Input 
                value={formData.thumbnail_url} 
                onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} 
                placeholder="https://..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Description / Content</Label>
              <Textarea 
                rows={6}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Write your content here..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Status</Label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="bg-[#0B2A5B] text-white hover:bg-[#1a3d7a]" onClick={handleSubmitNews}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
