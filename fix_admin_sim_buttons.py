import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/admin/AdminSimulator.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# add toast import
if 'toast' not in content:
    content = content.replace('import { Button } from "../../components/ui/button";', 'import { Button } from "../../components/ui/button";\nimport { toast } from "sonner";')

content = content.replace('<Button size="sm" variant="outline" className="border-gray-200">View All 342</Button>', '<Button size="sm" variant="outline" className="border-gray-200" onClick={() => toast.info("Viewing all 342 active sessions")}>View All 342</Button>')

content = content.replace('<Button variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 hover:border-[#D50032] hover:text-[#D50032]">', '<Button variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 hover:border-[#D50032] hover:text-[#D50032]" onClick={() => toast.info("Opening advance configuration module...")}>')

content = content.replace('<Button onClick={() => toggleSimulator(false)} variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 text-red-500 hover:bg-red-50">', '<Button onClick={() => { toggleSimulator(false); toast.success("Nodes shutdown successfully"); }} variant="outline" className="w-full h-12 flex items-center justify-between px-4 border-gray-200 text-red-500 hover:bg-red-50">')

with open('c:/work/fintrade/fintrade-frontend/app/pages/admin/AdminSimulator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Admin sim buttons fixed")
