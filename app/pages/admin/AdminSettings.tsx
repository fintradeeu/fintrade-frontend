import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import api from "../../services/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "FinTrade",
    support_email: "support@fintrade.com",
    default_course_price: "25000",
    exam_retake_fee: "300",
    simulator_starting_capital: "500000",
    simulator_daily_loss_limit: "10000",
    exam_passing_score: "60",
    exam_max_attempts: "3"
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      const grouped = res.data;
      const allSettings: any = {};
      
      // Flatten grouped settings into a key-value map
      ["general", "simulator", "exam", "payment"].forEach(category => {
        if (grouped[category]) {
          grouped[category].forEach((s: any) => {
            allSettings[s.key] = s.value;
          });
        }
      });
      
      setSettings(prev => ({ ...prev, ...allSettings }));
    } catch (err: any) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", { settings });
      toast.success("Settings updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <DashboardLayout role="admin"><div className="py-12 text-center">Loading settings...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Platform Settings</h1>
        <p className="text-[#0B2A5B]/70">Configure platform settings and preferences</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">General Settings</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platform_name || ""}
                  onChange={e => handleChange("platform_name", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.support_email || ""}
                  onChange={e => handleChange("support_email", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coursePrice">Default Course Price (₹)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  value={settings.default_course_price || ""}
                  onChange={e => handleChange("default_course_price", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
              <div>
                <Label htmlFor="retakeFee">Exam Retake Fee (₹)</Label>
                <Input
                  id="retakeFee"
                  type="number"
                  value={settings.exam_retake_fee || ""}
                  onChange={e => handleChange("exam_retake_fee", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Simulator Settings</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startingCapital">Starting Capital (₹)</Label>
                <Input
                  id="startingCapital"
                  type="number"
                  value={settings.simulator_starting_capital || ""}
                  onChange={e => handleChange("simulator_starting_capital", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
              <div>
                <Label htmlFor="dailyLossLimit">Daily Loss Limit (₹)</Label>
                <Input
                  id="dailyLossLimit"
                  type="number"
                  value={settings.simulator_daily_loss_limit || ""}
                  onChange={e => handleChange("simulator_daily_loss_limit", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-xl font-semibold text-[#0B2A5B] mb-6">Exam Settings</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={settings.exam_passing_score || ""}
                  onChange={e => handleChange("exam_passing_score", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
              <div>
                <Label htmlFor="maxAttempts">Max Attempts Per Exam</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  value={settings.exam_max_attempts || ""}
                  onChange={e => handleChange("exam_max_attempts", e.target.value)}
                  className="mt-2 bg-[#F4F1EA] border-[#0B2A5B]/20"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="border-[#0B2A5B]/20 text-[#0B2A5B]" onClick={fetchSettings}>
            Reset to Default
          </Button>
          <Button className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
