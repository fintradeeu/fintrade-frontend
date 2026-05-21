# Frontend Changes Documentation

## Summary
All cosmetic/hardcoded features in the student and teacher dashboards have been replaced with real API integrations.

---

## Changes Made

### 1. Certificate.tsx — Full Rewrite
**Before**: Hardcoded course name ("Professional Trading Fundamentals"), random client-side certificate ID, `alert()` stubs for download/share, hardcoded "5/5 modules", "3/3 exams", "59 hours".

**After**:
- Fetches real certificates from `GET /certificates`
- Fetches enrollments from `GET /courses/enrolled` for achievement stats
- Download button calls `GET /certificates/download/{certId}` (real PDF download)
- "Generate Certificate" button calls `POST /certificates/generate` for completed courses
- All achievements (courses completed, certificates earned, avg progress) computed from real data
- Lists all earned certificates with course name, grade, issue date

**API Endpoints Used**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/certificates` | List user's certificates |
| GET | `/certificates/download/{id}` | Download certificate PDF |
| POST | `/certificates/generate` | Generate new certificate |
| GET | `/courses/enrolled` | Get enrollment data for stats |

---

### 2. TradingSimulator.tsx — Full Rewrite
**Before**: 100% static — hardcoded chart data, instrument prices, trade history, portfolio value (₹5,42,500), P&L (₹1,750). `handlePlaceOrder()` was just an `alert()`.

**After**:
- Creates virtual account via `POST /simulator/start`
- Places real orders via `POST /simulator/trade` (with symbol, side, quantity, price)
- Closes positions via `POST /simulator/close`
- Fetches open positions from `GET /simulator/positions`
- Fetches trade history from `GET /simulator/trades`
- Fetches performance metrics from `GET /simulator/performance`
- Portfolio value, P&L, win rate all computed from real API data
- Trade history chart built from actual trades
- Still uses static instrument prices (no live market feed — noted in code)

**API Endpoints Used**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/simulator/start` | Create virtual trading account |
| POST | `/simulator/trade` | Place a trade order |
| POST | `/simulator/close` | Close an open position |
| GET | `/simulator/positions` | List open positions |
| GET | `/simulator/trades` | List trade history |
| GET | `/simulator/performance` | Get performance metrics (win rate, PnL, etc.) |

---

### 3. Leaderboard.tsx — Full Rewrite
**Before**: 100% mock data with `setTimeout` — fake users ("Arjun Mehta", "Priya Sharma"), hardcoded "Your Rank: #42", "Your Score: 4,250", "Current Tier: Advanced Trader".

**After**:
- Tries `GET /dashboard/leaderboard` first (if endpoint exists)
- Falls back to building rankings from `GET /exams/results/analysis`
- User's rank and score shown from real data
- Badge tier ("Grandmaster", "Master", etc.) computed from actual score thresholds
- Shows "No Rankings Yet" if no data available

**API Endpoints Used**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/leaderboard` | Primary leaderboard data |
| GET | `/exams/results/analysis` | Fallback — own exam performance |

---

### 4. TeacherStudents.tsx — Minor Fix
**Before**: "At Risk" count hardcoded as `0`.
**After**: Computed as `students.filter(s => progress < 20% && progress > 0).length`.

---

### 5. TeacherReports.tsx — Minor Fix
**Before**: `assignment_completion` fell back to hardcoded `82` if missing.
**After**: Shows "—" if the field is null/undefined.

---

### 6. DoubtSessions.tsx — Placeholder Update
**Before**: Showed hardcoded stats (0 pending, 0 resolved) with no API calls.
**After**: Shows a proper "Coming Soon" placeholder since no backend endpoint exists yet.

---

## Pages Verified as Already Dynamic (No Changes Needed)
- StudentDashboard, Performance, Placement, MonthlyExams
- CourseEnrollment, Modules, AITutor, Lectures
- EntranceExam, CourseExamInterface, ExamResultReview, StudentAssignments
- TeacherDashboard, TeacherCourses, TeacherLectures
- TeacherExams, TeacherAssignments, QuestionBuilder
