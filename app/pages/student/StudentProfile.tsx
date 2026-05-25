import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Save, UserCircle } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import api from "../../services/api";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

const emptyProfile: ProfileForm = {
  full_name: "",
  email: "",
  phone: "",
};

export default function StudentProfile() {
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => {
    return (form.full_name || "User")
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [form.full_name]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setForm({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch {
        // Fresh API data below will repair stale local storage.
      }
    }

    api
      .get("/auth/me")
      .then((res) => {
        const user = res.data;
        localStorage.setItem("user", JSON.stringify(user));
        setForm({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      })
      .catch(() => toast.error("Unable to load your profile"))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/auth/me", {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setForm({
        full_name: res.data.full_name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="student" userName={form.full_name || undefined}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">Profile</h1>
        <p className="text-[#0B2A5B]/70">View and edit the details used during registration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <Card className="p-6 bg-white shadow-lg border border-[#0B2A5B]/10 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#D50032] text-white flex items-center justify-center shadow-lg mb-4">
              {initials ? <span className="text-3xl font-bold">{initials}</span> : <UserCircle size={48} />}
            </div>
            <h2 className="text-xl font-bold text-[#0B2A5B] break-words">{form.full_name || "Student"}</h2>
            <p className="text-sm text-[#0B2A5B]/60 mt-1">Student Account</p>
            <div className="w-full mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-[#0B2A5B]/80">
                <Mail size={16} className="text-[#C2A86A]" />
                <span className="truncate">{form.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#0B2A5B]/80">
                <Phone size={16} className="text-[#C2A86A]" />
                <span className="truncate">{form.phone || "No phone number"}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg border border-[#0B2A5B]/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="profileName">Full Name</Label>
              <Input
                id="profileName"
                type="text"
                autoComplete="name"
                value={form.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
                className="mt-2 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                disabled={loading || saving}
                required
              />
            </div>

            <div>
              <Label htmlFor="profileEmail">Email Address</Label>
              <Input
                id="profileEmail"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                disabled={loading || saving}
                required
              />
            </div>

            <div>
              <Label htmlFor="profilePhone">Phone Number</Label>
              <Input
                id="profilePhone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="mt-2 bg-gray-50 border-gray-300 focus:border-[#D50032] focus:ring-[#D50032]"
                disabled={loading || saving}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="bg-[#D50032] hover:bg-[#b00029] text-white shadow-lg"
                disabled={loading || saving}
              >
                <Save size={16} className="mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
