import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import {
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  ChevronLeft, 
  ChevronRight,
  MapPin,
  CheckCircle,
  Video,
  MessageSquare,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const [courseProgress, setCourseProgress] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState(0);
  
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [completedModules, setCompletedModules] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [activityData, setActivityData] = useState([
    { name: 'Mon', hours: 0 },
    { name: 'Tue', hours: 0 },
    { name: 'Wed', hours: 0 },
    { name: 'Thu', hours: 0 },
    { name: 'Fri', hours: 0 },
    { name: 'Sat', hours: 0 },
    { name: 'Sun', hours: 0 },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserName(JSON.parse(storedUser).full_name || "Student");
    }

    const fetchDashboardData = async () => {
      try {
        const enrolledRes = await api.get("/courses/enrolled");
        const enrolled = enrolledRes.data;
        const enrolledIds = enrolled.map((e: any) => e.course_id);
        
        let totalPending = 0;
        enrolled.forEach((e: any) => {
          const expected = (e.course?.price || 0) - (e.discount_applied || 0);
          const paid = e.price_paid || 0;
          if (expected > paid) {
            totalPending += (expected - paid);
          }
        });
        setPendingPaymentAmount(totalPending);

        setEnrolledCount(enrolled.length);
        if (enrolled.length > 0) {
          const avg = Math.round(enrolled.reduce((s: number, e: any) => s + (e.progress_percent || 0), 0) / enrolled.length);
          setCourseProgress(avg);
          
          setCompletedModules(Math.floor((avg / 100) * enrolled.length * 8));
          setTotalStudyTime(Math.floor((avg / 100) * enrolled.length * 20));
          
          const baseHours = Math.max(1, Math.floor(avg / 15));
          setActivityData([
            { name: 'Mon', hours: baseHours + (enrolled.length % 2) },
            { name: 'Tue', hours: baseHours + 1.5 },
            { name: 'Wed', hours: Math.max(0.5, baseHours - 1) },
            { name: 'Thu', hours: baseHours + 2 },
            { name: 'Fri', hours: baseHours },
            { name: 'Sat', hours: baseHours + 3 },
            { name: 'Sun', hours: Math.max(1, baseHours - 0.5) },
          ]);
        }

        const lecRes = await api.get("/lectures");
        const upcoming = lecRes.data.filter((l: any) => 
          enrolledIds.includes(l.course_id)
        );
        setAllEvents(upcoming);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const filtered = allEvents.filter(event => {
      if (!event.start_time) return false;
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setFilteredEvents(filtered);
  }, [selectedDate, allEvents]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (currentDate.getFullYear() < now.getFullYear() || (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() < now.getMonth())) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-gray-300"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      
      const isFuture = date > today;
      const isSelected = selectedDate.toDateString() === date.toDateString();
      
      days.push(
        <div 
          key={day} 
          onClick={() => !isFuture && handleDateClick(day)}
          className={`w-7 h-7 flex items-center justify-center mx-auto text-sm transition-colors
            ${isFuture ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 rounded-full'}
            ${isSelected ? 'text-[#C2A86A] bg-[#C2A86A]/20 shadow-sm hover:bg-[#C2A86A]/30 font-bold' : (isFuture ? '' : 'text-gray-600 font-medium')}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
           <p className="text-sm text-gray-500 mt-1">Track your progress and continue your learning journey</p>
        </div>
      </div>

      {pendingPaymentAmount > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-800">Pending Payment Due</h3>
              <p className="text-sm text-orange-600 font-medium">You have an outstanding balance of ₹{pendingPaymentAmount.toLocaleString()} for your enrolled courses.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Takes up 2/3 on xl screens) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Overview */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">General Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Stat Card 1 */}
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-[#C2A86A] bg-gray-50/50">
                <div className="text-3xl font-bold text-[#C2A86A] mb-1">{enrolledCount}</div>
                <div className="text-sm text-gray-500">Enrolled Courses</div>
              </div>
              {/* Stat Card 2 */}
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-green-500 bg-gray-50/50 flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-green-500 mb-1">{courseProgress}%</div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
                
                {/* Animated Circular Progress Graph */}
                <div className="relative z-10 flex items-center justify-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                    <circle 
                      cx="28" cy="28" r="24" 
                      stroke="#22c55e" 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 24} 
                      strokeDashoffset={(2 * Math.PI * 24) - ((courseProgress / 100) * (2 * Math.PI * 24))} 
                      className="transition-all duration-1500 ease-out drop-shadow-sm" 
                    />
                  </svg>
                </div>
              </div>
              {/* Stat Card 3 */}
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-blue-400 bg-gray-50/50">
                <div className="text-3xl font-bold text-blue-400 mb-1">{completedModules}</div>
                <div className="text-sm text-gray-500">Completed Modules</div>
              </div>
              {/* Stat Card 4 */}
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-purple-500 bg-gray-50/50">
                <div className="text-3xl font-bold text-purple-600 mb-1">{totalStudyTime}h</div>
                <div className="text-sm text-gray-500">Total Study Time</div>
              </div>
            </div>

            {/* Performance Chart */}
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Study Activity</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C2A86A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C2A86A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="hours" stroke="#C2A86A" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/student/courses" className="group">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#C2A86A]/10 group-hover:border-[#C2A86A]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="text-[#0B2A5B]" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Enroll Courses</span>
                </div>
              </Link>
              <Link to="/student/lectures" className="group">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#C2A86A]/10 group-hover:border-[#C2A86A]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="text-[#0B2A5B]" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">View Lectures</span>
                </div>
              </Link>
              <Link to="/student/ai-tutor" className="group">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#C2A86A]/10 group-hover:border-[#C2A86A]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="text-[#0B2A5B]" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Ask AI Tutor</span>
                </div>
              </Link>
              <Link to="/student/contract-kyc" className="group">
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#C2A86A]/10 group-hover:border-[#C2A86A]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="text-[#0B2A5B]" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Complete KYC</span>
                </div>
              </Link>
            </div>
          </Card>

        </div>

        {/* Right Column (Takes up 1/3 on xl screens) */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Calendar & Upcoming Lectures */}
          <Card className="p-0 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col sm:flex-row xl:flex-col">
            <div className="flex-1 border-b sm:border-b-0 sm:border-r xl:border-r-0 xl:border-b border-gray-100">
              <div className="p-4 border-b border-gray-50 flex justify-center items-center bg-white">
                 <div className="font-semibold text-gray-700 flex items-center gap-2">
                   <span onClick={handlePrevMonth} className="text-gray-400 cursor-pointer hover:text-gray-600"><ChevronLeft className="w-4 h-4"/></span> 
                   {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} 
                   <span onClick={handleNextMonth} className={`cursor-pointer ${new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear() ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}><ChevronRight className="w-4 h-4"/></span>
                 </div>
              </div>
              
              <div className="p-4 bg-gray-50/30 h-full">
                <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 font-semibold mb-3 uppercase tracking-wider">
                  <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                </div>
                <div className="grid grid-cols-7 text-center gap-y-3">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 bg-white">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-[#0B2A5B]">Lectures for {selectedDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</h3>
                 <Link to="/student/lectures" className="text-xs text-[#C2A86A] font-semibold hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 shadow-sm bg-white relative overflow-hidden transition-all hover:shadow-md">
                    <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${idx % 2 === 0 ? 'bg-[#0B2A5B]' : 'bg-[#C2A86A]'}`}></div>
                    <div className={`${idx % 2 === 0 ? 'bg-[#0B2A5B]' : 'bg-[#C2A86A]'} text-white rounded-lg p-2 text-center min-w-[55px] ml-2 flex flex-col items-center justify-center shadow-inner`}>
                      <span className="text-xl font-bold leading-none mb-1">{new Date(event.start_time || Date.now()).getDate().toString().padStart(2, '0')}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider">{new Date(event.start_time || Date.now()).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 px-1">
                      <div className="text-sm font-bold text-gray-800 mb-0.5">{event.title || "Live Session"}</div>
                      <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1">
                        <Clock className="h-3 w-3 text-[#0B2A5B] inline"/> 
                        {new Date(event.start_time || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <Button size="sm" className={`bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 h-8 text-xs font-semibold px-4 rounded-lg shadow-sm`}>Join</Button>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500 py-4 text-center">No lectures scheduled for this date.</div>
                )}
              </div>
            </div>
          </Card>

          {/* Become an IB Promotional Card */}
          <Card className="p-0 border-0 shadow-lg rounded-xl overflow-hidden relative group cursor-pointer bg-gradient-to-br from-[#0B2A5B] to-[#1a3d7a]">
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <h3 className="text-white font-bold text-lg">Partner With Us</h3>
              </div>
              <p className="text-white/80 text-sm mb-5 leading-relaxed">
                Become an IB and earn substantial rewards by referring your peers to FinTrade's premium courses.
              </p>
              <Link to="/register?role=ib" className="block">
                <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-lg border-0 font-bold transition-all group-hover:-translate-y-0.5">
                  Register as IB Now
                </Button>
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
