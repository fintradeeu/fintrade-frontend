import re

with open('c:/work/fintrade/fintrade-frontend/app/pages/student/CourseEnrollment.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'CourseCheckoutModal' not in content:
    content = content.replace('import { Card }', 'import CourseCheckoutModal from "../../components/CourseCheckoutModal";\nimport { Card }')

state_injection = '''
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<any>(null);
'''
content = content.replace('const [showPayment, setShowPayment] = useState(false);', state_injection)

# Replace 'onClick={() => handleEnroll(course.id)}' with 'onClick={() => setSelectedCourseForCheckout(course)}'
content = content.replace('onClick={() => handleEnroll(course.id)}', 'onClick={() => setSelectedCourseForCheckout(course)}')

# Remove the showPayment ternary and fake payment UI
# The fake payment UI starts at '{!showPayment ? (' and ends before the closing of the main div
# This is tricky with string replace, so I'll just write the JSX directly to append CourseCheckoutModal at the bottom before </DashboardLayout>

content = content.replace('{!showPayment ? (', '')

# We need to remove the ': ( <div className="max-w-3xl... ' part
# Using regex to find the start of the else branch
else_match = re.search(r'\) : \(\s*<div className="max-w-3xl mx-auto">', content)
if else_match:
    start_idx = else_match.start()
    # Find matching closing tag for this div
    # Actually just string replace the rest of it until )} before </DashboardLayout>
    end_idx = content.find('</DashboardLayout>', start_idx)
    if end_idx != -1:
        # remove everything between start_idx and end_idx
        # wait, there's a )} that belongs to the ternary.
        pass

# simpler approach: just find and replace the whole return block if we know it.
