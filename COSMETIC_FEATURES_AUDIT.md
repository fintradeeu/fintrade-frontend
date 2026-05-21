# Cosmetic Features Audit — Student & Teacher Dashboards

Audited all 16 student pages and 9 teacher pages. Below are pages with cosmetic/hardcoded data.

## 🔴 Fully Cosmetic (No API calls at all)

### 1. Leaderboard.tsx — 100% Hardcoded Mock Data
- **Lines 13-26**: Fake leaderboard with `setTimeout` mock — "Arjun Mehta", "Priya Sharma" etc.
- **Lines 47-52**: Hardcoded "Your Rank: #42", "Your Score: 4,250"
- **Lines 104-105**: Hardcoded "Current Tier: Advanced Trader"
- **Lines 109-110**: Hardcoded "Points to next tier: 750 XP", 65% progress bar
- **Fix**: Backend has no leaderboard endpoint. Will compute from exam scores + lesson completions.

### 2. TradingSimulator.tsx — 100% Hardcoded Static Data
- **Lines 31-49**: Hardcoded chart data, instrument prices (NIFTY 50: 58720, etc.)
- **Lines 51-82**: Hardcoded trade history
- **Lines 88-90**: Hardcoded portfolio value (542,500)
- **Lines 126-134**: Hardcoded "Today's P&L: 1,750", "Available Margin: 2,45,680"
- **Line 93-96**: `handlePlaceOrder` just shows an `alert()`
- **Fix**: Backend HAS `/simulator` endpoints. Need to connect them.

### 3. Certificate.tsx — Mostly Hardcoded
- **Lines 25-32**: Course name hardcoded as "Professional Trading Fundamentals", score as "—", grade as "—"
- **Lines 29**: Random certificate ID generated client-side
- **Lines 34-40**: Download/Share are just `alert()` stubs
- **Lines 133-148**: Hardcoded "Modules Completed: 5/5", "Exams Passed: 3/3", "Study Hours: 59 hours"
- **Fix**: Backend HAS `/certificates` endpoint. Need to fetch real data.

---

## 🟡 Partially Cosmetic (Some API calls but with hardcoded fallbacks)

### 4. TeacherStudents.tsx — Minor Hardcoded Stats
- **Line 55**: "At Risk" count hardcoded as `0`
- **Line 59**: "Avg Attendance" hardcoded as `—`
- **Fix**: Compute "At Risk" from students with progress < 20%. Attendance isn't tracked — keep as "—".

### 5. TeacherReports.tsx — Minor Hardcoded Fallback
- **Line 50**: `assignment_completion` falls back to hardcoded `82` if missing from API
- **Fix**: Remove the `|| 82` fallback, show "—" instead.

### 6. DoubtSessions.tsx — Stub Page
- All stats are hardcoded `0` and there's no API integration
- **Fix**: The backend has no doubt sessions endpoint. This is acceptable as a placeholder — just needs a "Coming Soon" indicator.

---

## ✅ Already Dynamic (No changes needed)
- StudentDashboard.tsx, Performance.tsx, Placement.tsx, MonthlyExams.tsx
- CourseEnrollment.tsx, Modules.tsx, AITutor.tsx, Lectures.tsx
- EntranceExam.tsx, CourseExamInterface.tsx, ExamResultReview.tsx, StudentAssignments.tsx
- TeacherDashboard.tsx, TeacherCourses.tsx, TeacherLectures.tsx
- TeacherExams.tsx, TeacherAssignments.tsx, QuestionBuilder.tsx
