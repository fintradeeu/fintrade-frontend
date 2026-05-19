import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Edit, Trash2, Video, Calendar, Eye, Link as LinkIcon, Search, Filter, Newspaper, Info, PhoneCall } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export default function AdminNews() {
  const [activeTab, setActiveTab] = useState("news");
  
  // CMS Content State
  const [cmsContent, setCmsContent] = useState({
    about: "We are not building another trading course company. We are building India's first Trader-to-Funded Professional Pipeline.",
    contact_email: "support@thefintrade.com",
    contact_phone: "+91 98765 43210",
    address: "Financial District, Mumbai, Maharashtra, India"
  });

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#121212' }}>Blog & CMS Manager</h1>
          <p className="text-gray-600 mt-1">Manage website content, blogs, and market updates</p>
        </div>
      </div>

      <Tabs defaultValue="news" onValueChange={setActiveTab} className="space-y-6">
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
              <Button style={{ background: '#D50032', color: 'white' }}><Plus className="w-4 h-4 mr-2" /> Add Update</Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Manage the YouTube analysis videos and market updates shown on the homepage.</p>
            {/* Table placeholder - reuse existing logic if needed */}
            <div className="bg-[#F4F1EA] p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
               <p className="text-gray-400">Market Update management table goes here...</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0B2A5B]">Blog Management</h3>
              <Button style={{ background: '#D50032', color: 'white' }}><Plus className="w-4 h-4 mr-2" /> New Blog</Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Create and edit articles for the website blog section.</p>
            <div className="bg-[#F4F1EA] p-8 rounded-xl text-center border-2 border-dashed border-gray-200">
               <p className="text-gray-400">Blog story management table goes here...</p>
            </div>
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
                    value={cmsContent.about} 
                    onChange={e => setCmsContent({...cmsContent, about: e.target.value})}
                    className="bg-[#F4F1EA] border-gray-200"
                  />
                </div>
                <Button className="bg-[#0B2A5B] text-white w-full">Update About Content</Button>
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
                <Button className="bg-[#0B2A5B] text-white w-full">Save Contact Details</Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

