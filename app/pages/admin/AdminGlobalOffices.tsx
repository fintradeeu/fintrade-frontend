import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Globe, Mail, Phone, Users, MapPin, Save, Plus, Trash2, RefreshCw, Upload, Info } from "lucide-react";
import api from "../../services/api";
import { toast } from "sonner";
import { confirmPopup } from "../../utils/popup";

interface GlobalOfficeItem {
  code: string;
  logo_url?: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  contact: string;
}

const defaultGlobalOffices: GlobalOfficeItem[] = [
  { code: "in", logo_url: "", country: "India", address: "10th Floor, Shivalik Complex, Panchvati Circle, Ahmedabad, Gujarat 380006", email: "india@thefintrade.com", phone: "+91 92746 75947", contact: "Mansi Patel" },
  { code: "ae", logo_url: "", country: "UAE", address: "Business Bay, Dubai, United Arab Emirates", email: "uae@thefintrade.com", phone: "+971 52 418 9042", contact: "Ahmed Khan" },
  { code: "gb", logo_url: "", country: "United Kingdom", address: "Canary Wharf, London E14, United Kingdom", email: "uk@thefintrade.com", phone: "+44 20 4571 8840", contact: "Oliver Bennett" },
  { code: "us", logo_url: "", country: "United States", address: "Wall Street, New York, NY 10005, United States", email: "usa@thefintrade.com", phone: "+1 212 555 0186", contact: "Sophia Carter" },
  { code: "ca", logo_url: "", country: "Canada", address: "Bay Street, Toronto, ON M5J, Canada", email: "canada@thefintrade.com", phone: "+1 416 555 0148", contact: "Liam Martin" },
  { code: "au", logo_url: "", country: "Australia", address: "George Street, Sydney NSW 2000, Australia", email: "australia@thefintrade.com", phone: "+61 2 8015 6820", contact: "Emily Wilson" },
  { code: "sg", logo_url: "", country: "Singapore", address: "Marina Bay Financial Centre, Singapore 018981", email: "singapore@thefintrade.com", phone: "+65 3159 2147", contact: "Wei Tan" },
  { code: "de", logo_url: "", country: "Germany", address: "Taunusanlage, Frankfurt am Main 60329, Germany", email: "germany@thefintrade.com", phone: "+49 69 2475 0190", contact: "Lukas Weber" },
  { code: "fr", logo_url: "", country: "France", address: "La Defense, Paris 92800, France", email: "france@thefintrade.com", phone: "+33 1 89 71 2044", contact: "Camille Laurent" },
  { code: "jp", logo_url: "", country: "Japan", address: "Marunouchi, Chiyoda-ku, Tokyo 100-0005, Japan", email: "japan@thefintrade.com", phone: "+81 3 4578 9120", contact: "Kenji Sato" },
  { code: "za", logo_url: "", country: "South Africa", address: "Sandton Financial District, Johannesburg 2196, South Africa", email: "africa@thefintrade.com", phone: "+27 10 500 7812", contact: "Aisha Naidoo" },
];

const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = api.defaults.baseURL || "";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function AdminGlobalOffices() {
  const [offices, setOffices] = useState<GlobalOfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/settings/landing-page");
      if (res.data && Array.isArray(res.data.global_offices)) {
        setOffices(res.data.global_offices);
      } else {
        setOffices(defaultGlobalOffices);
      }
    } catch (err) {
      toast.error("Failed to load global offices configuration");
      setOffices(defaultGlobalOffices);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async (updatedOffices: GlobalOfficeItem[]) => {
    setSaving(true);
    try {
      await api.put("/admin/settings/landing-page", { global_offices: updatedOffices });
      toast.success("Global offices saved successfully!");
      fetchConfig();
    } catch (err) {
      toast.error("Failed to save global offices");
    } finally {
      setSaving(false);
    }
  };

  const updateOffice = (idx: number, patch: Partial<GlobalOfficeItem>) => {
    const list = [...offices];
    list[idx] = { ...list[idx], ...patch };
    setOffices(list);
  };

  const handleAddOffice = () => {
    setOffices(p => [
      ...p,
      { code: "", logo_url: "", country: "", address: "", email: "", phone: "", contact: "" }
    ]);
  };

  const handleRemoveOffice = async (idx: number) => {
    const confirmed = await confirmPopup("Are you sure you want to remove this global office?");
    if (!confirmed) return;
    const list = [...offices];
    list.splice(idx, 1);
    setOffices(list);
  };

  const handleRestoreDefaults = async () => {
    const confirmed = await confirmPopup("Restore the 11 default global offices? This will overwrite your current list.");
    if (!confirmed) return;
    setOffices(defaultGlobalOffices);
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="py-12 text-center text-slate-500 font-sans font-semibold">
          Loading global offices configuration...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 font-sans">
        <h1 className="text-3xl font-black text-[#0B2A5B] mb-2">Global Offices</h1>
        <p className="text-slate-500 font-medium">Manage the global offices ticker displayed below the main landing page hero banner.</p>
      </div>

      <div className="space-y-6 font-sans">
        <Card className="p-5 border border-blue-100 bg-blue-50/50 rounded-2xl">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 leading-relaxed font-medium">
              Hovering over any country on the landing page global offices strip will reveal a detailed tooltip containing:
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                <li><strong>Country Flag/Logo:</strong> Loaded from the <em>Country Code</em> flag database, or a custom uploaded image.</li>
                <li><strong>Country Name:</strong> Displayed at the top of the details bubble.</li>
                <li><strong>Contact Person (Name):</strong> Displayed with the user profile icon.</li>
                <li><strong>Contact No. &amp; Email:</strong> Actionable details for phone and mail links.</li>
                <li><strong>Office Address:</strong> Full location details of the target office.</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleRestoreDefaults}
            className="border-slate-200 hover:border-red-500 hover:text-red-500 text-slate-700 rounded-xl font-bold bg-white px-5 py-4 h-auto shadow-sm transition-all"
          >
            <RefreshCw size={16} className="mr-2" /> Restore 11 Defaults
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleAddOffice}
              className="border-slate-200 hover:border-[#D50032] hover:text-[#D50032] text-slate-700 rounded-xl font-bold bg-white px-5 py-4 h-auto shadow-sm transition-all"
            >
              <Plus size={16} className="mr-2" /> Add Office
            </Button>
            <Button
              onClick={() => saveConfig(offices)}
              disabled={saving}
              className="bg-gradient-to-r from-[#D50032] to-[#FF4D70] hover:brightness-105 text-white rounded-xl font-bold px-6 py-4 h-auto shadow-md shadow-red-100 transition-all"
            >
              <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Global Offices"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {offices.map((office, idx) => {
            const logoPreview = office.logo_url
              ? getImageUrl(office.logo_url)
              : office.code
                ? `https://flagcdn.com/w80/${office.code.toLowerCase()}.png`
                : "";

            return (
              <Card key={`${office.country || "new"}-${idx}`} className="p-5 border border-slate-100 shadow-sm rounded-2xl hover:border-slate-200 transition-all bg-white">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Flag / Custom Logo preview & upload column */}
                  <div className="lg:w-48 flex-shrink-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-16 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm">
                          {logoPreview ? (
                            <img src={logoPreview} alt={`${office.country || "Office"} logo`} className="h-full w-full object-cover" />
                          ) : (
                            <Globe className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Office #{idx + 1}</p>
                          <p className="text-sm font-bold text-slate-800">{office.country || "New Office"}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-full text-xs font-bold border border-dashed border-slate-200 hover:border-[#D50032] hover:text-[#D50032] text-slate-600 rounded-xl p-3 bg-slate-50/50 transition-all">
                          <Upload size={14} /> Upload Custom Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const formData = new FormData();
                              formData.append("file", e.target.files[0]);
                              try {
                                toast.loading("Uploading country logo...");
                                const res = await api.post("/admin/upload", formData, {
                                  headers: { "Content-Type": "multipart/form-data" }
                                });
                                toast.dismiss();
                                if (res.data?.url) {
                                  updateOffice(idx, { logo_url: res.data.url });
                                  toast.success("Country logo uploaded!");
                                } else {
                                  toast.error("Logo upload response error.");
                                }
                              } catch {
                                toast.dismiss();
                                toast.error("Country logo upload failed.");
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOffice(idx)}
                      className="mt-4 lg:mt-0 self-start inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition-all shadow-sm"
                      title="Remove office"
                    >
                      <Trash2 size={14} /> Remove Office
                    </button>
                  </div>

                  {/* Input form fields column */}
                  <div className="grid flex-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Globe size={13} /> Country Code</Label>
                      <Input
                        value={office.code || ""}
                        onChange={e => updateOffice(idx, { code: e.target.value.toLowerCase() })}
                        placeholder="e.g. in, us, ae, gb"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Globe size={13} /> Country Name</Label>
                      <Input
                        value={office.country || ""}
                        onChange={e => updateOffice(idx, { country: e.target.value })}
                        placeholder="Country name"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Mail size={13} /> Email</Label>
                      <Input
                        value={office.email || ""}
                        onChange={e => updateOffice(idx, { email: e.target.value })}
                        placeholder="office@thefintrade.com"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Phone size={13} /> Contact No.</Label>
                      <Input
                        value={office.phone || ""}
                        onChange={e => updateOffice(idx, { phone: e.target.value })}
                        placeholder="+91 92746 75947"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Users size={13} /> Contact Person Name</Label>
                      <Input
                        value={office.contact || ""}
                        onChange={e => updateOffice(idx, { contact: e.target.value })}
                        placeholder="Name of contact person"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Globe size={13} /> Custom Logo URL</Label>
                      <Input
                        value={office.logo_url || ""}
                        onChange={e => updateOffice(idx, { logo_url: e.target.value })}
                        placeholder="Optional image url link"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800 text-xs"
                      />
                    </div>
                    <div className="md:col-span-2 xl:col-span-3 space-y-1">
                      <Label className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin size={13} /> Address</Label>
                      <Input
                        value={office.address || ""}
                        onChange={e => updateOffice(idx, { address: e.target.value })}
                        placeholder="Office address"
                        className="bg-slate-50/40 border-slate-200 focus:bg-white rounded-xl py-5 transition-all text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
