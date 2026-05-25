import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/teacher/TeacherAssignments.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fetch_logic = '''
      // In a real app we'd fetch all assignments for the teacher's courses
      // For MVP we just show a placeholder list or fetch sequentially
      const allAssignments: any[] = [];
      for (const c of coursesRes.data) {
        const aRes = await api.get(/courses//assignments);
        allAssignments.push(...aRes.data);
      }
      setAssignments(allAssignments);
'''

replacement = '''
      const aRes = await api.get(/admin/assignments);
      setAssignments(aRes.data);
'''

content = content.replace(fetch_logic, replacement)

with open('c:/work/fintrade/fintrade-frontend/app/pages/teacher/TeacherAssignments.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("TeacherAssignments.tsx updated")
