import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/admin/AdminRoles.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useEffect and api import
if 'import api from' not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport api from "../../services/api";\nimport { toast } from "sonner";')

state_replace = '''
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/roles");
      setAdminUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };
'''

# We need to remove the giant hardcoded array. It starts at const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
# and ends at   ]); right before const [isAddDialogOpen

start_idx = content.find('const [adminUsers, setAdminUsers] = useState<AdminUser[]>([')
end_idx = content.find('const [isAddDialogOpen', start_idx)

if start_idx != -1 and end_idx != -1:
    # Just need to find the previous   ]);
    actual_end_idx = content.rfind('  ]);\n', start_idx, end_idx) + 6
    content = content[:start_idx] + state_replace + content[actual_end_idx:]

add_replace = '''  const handleAddAdmin = async () => {
    try {
        const newAdmin = { ...formData, lastActive: new Date().toISOString() };
        await api.post("/admin/roles", newAdmin);
        toast.success("Admin created");
        fetchAdmins();
        setIsAddDialogOpen(false);
        resetForm();
    } catch (err) {
        toast.error("Failed to add admin");
    }
  };'''
content = re.sub(r'const handleAddAdmin = \(\) => \{.*?\n  \};', add_replace, content, flags=re.DOTALL)

edit_replace = '''  const handleEditAdmin = async () => {
    if (selectedAdmin) {
      try {
        await api.put(/admin/roles/, formData);
        toast.success("Admin updated");
        fetchAdmins();
        setIsEditDialogOpen(false);
        setSelectedAdmin(null);
        resetForm();
      } catch (err) {
        toast.error("Failed to update admin");
      }
    }
  };'''
content = re.sub(r'const handleEditAdmin = \(\) => \{.*?\n  \};', edit_replace, content, flags=re.DOTALL)

del_replace = '''  const handleDeleteAdmin = async (id: number) => {
    if (confirm("Are you sure you want to remove this admin?")) {
      try {
        await api.delete(/admin/roles/);
        toast.success("Admin removed");
        fetchAdmins();
      } catch (err) {
        toast.error("Failed to remove admin");
      }
    }
  };'''
content = re.sub(r'const handleDeleteAdmin = \(id: number\) => \{.*?\n  \};', del_replace, content, flags=re.DOTALL)

with open('c:/work/fintrade/fintrade-frontend/app/pages/admin/AdminRoles.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("AdminRoles.tsx fixed")
