import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "react-router";
import { 
  Video, 
  MessageCircle, 
  FileQuestion, 
  Clock, 
  TrendingUp, 
  BookOpen,
  ChevronLeft,
  ChevronRight
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

export default function TeacherDashboard() {
  const [userName, setUserName] = useState("Teacher");
  const [lectures, setLectures] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any>(null);
  
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Dummy engagement data for the chart
  const engagementData = [
    { name: 'Mon', attendance: 85 },
    { name: 'Tue', attendance: 92 },
    { name: 'Wed', attendance: 78 },
    { name: 'Thu', attendance: 95 },
    { name: 'Fri', attendance: 88 },
    { name: 'Sat', attendance: 110 },
    { name: 'Sun', attendance: 105 },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserName(parsed.full_name || "Teacher");
      setPermissions(parsed.permissions || null);
    }

    api.get("/lectures").then((r) => setLectures(r.data)).catch(console.error);
    api.get("/courses").then((r) => setCourses(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const filtered = lectures.filter(event => {
      const startTime = event.scheduled_at || event.start_time;
      if (!startTime) return false;
      const eventDate = new Date(startTime);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    setFilteredEvents(filtered);
  }, [selectedDate, lectures]);

  const now = new Date();
  const upcomingCount = lectures.filter((l) => new Date(l.scheduled_at || l.start_time) > now || l.is_live).length;
  const liveCount = lectures.filter((l) => l.is_live).length;
  const totalLectures = lectures.length;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
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
      
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();
      
      days.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          className={`w-7 h-7 flex items-center justify-center mx-auto text-sm transition-colors cursor-pointer rounded-full
            ${isSelected ? 'text-[#C2A86A] bg-[#C2A86A]/20 shadow-sm hover:bg-[#C2A86A]/30 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}
            ${isToday && !isSelected ? 'border border-[#C2A86A]/50' : ''}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <DashboardLayout role="teacher">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
           <p className="text-sm text-gray-500 mt-1">Manage your classes and student progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Overview */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">General Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-[#C2A86A] bg-gray-50/50">
                <div className="text-3xl font-bold text-[#C2A86A] mb-1">{courses.length}</div>
                <div className="text-sm text-gray-500">Total Courses</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-[#0B2A5B] bg-gray-50/50">
                <div className="text-3xl font-bold text-[#0B2A5B] mb-1">{totalLectures}</div>
                <div className="text-sm text-gray-500">Total Lectures</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-orange-500 bg-gray-50/50">
                <div className="text-3xl font-bold text-orange-500 mb-1">{upcomingCount}</div>
                <div className="text-sm text-gray-500">Upcoming</div>
              </div>
              <div className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-green-500 bg-gray-50/50 flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-green-500 mb-1">{liveCount}</div>
                  <div className="text-sm text-gray-500">Live Now</div>
                </div>
                {liveCount > 0 && (
                  <div className="relative z-10 flex items-center justify-center">
                     <span className="relative flex h-4 w-4 mr-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                     </span>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Chart */}
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Student Attendance</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2A5B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0B2A5B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="attendance" stroke="#0B2A5B" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(!permissions || permissions.manageCourses !== false) && (
                <Link to="/teacher/courses" className="group">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#0B2A5B]/5 group-hover:border-[#0B2A5B]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="text-[#0B2A5B]" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Manage Courses</span>
                  </div>
                </Link>
              )}
              {(!permissions || permissions.manageLectures !== false) && (
                <Link to="/teacher/lectures" className="group">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#0B2A5B]/5 group-hover:border-[#0B2A5B]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="text-[#0B2A5B]" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Schedule Lecture</span>
                  </div>
                </Link>
              )}
              {(!permissions || permissions.manageDoubts !== false) && (
                <Link to="/teacher/doubt-sessions" className="group">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#0B2A5B]/5 group-hover:border-[#0B2A5B]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="text-[#0B2A5B]" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Resolve Doubts</span>
                  </div>
                </Link>
              )}
              {(!permissions || permissions.manageExams !== false) && (
                <Link to="/teacher/exams" className="group">
                  <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 group-hover:bg-[#0B2A5B]/5 group-hover:border-[#0B2A5B]/30 transition-all flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileQuestion className="text-[#0B2A5B]" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0B2A5B]">Create Exam</span>
                  </div>
                </Link>
              )}
            </div>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Calendar & Upcoming Lectures */}
          <Card className="p-0 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col sm:flex-row xl:flex-col">
            <div className="flex-1 border-b sm:border-b-0 sm:border-r xl:border-r-0 xl:border-b border-gray-100">
              <div className="p-4 border-b border-gray-50 flex justify-center items-center bg-white">
                 <div className="font-semibold text-gray-700 flex items-center gap-2">
                   <span onClick={handlePrevMonth} className="text-gray-400 cursor-pointer hover:text-gray-600"><ChevronLeft className="w-4 h-4"/></span> 
                   {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} 
                   <span onClick={handleNextMonth} className="text-gray-400 cursor-pointer hover:text-gray-600"><ChevronRight className="w-4 h-4"/></span>
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
                 <Link to="/teacher/lectures" className="text-xs text-[#C2A86A] font-semibold hover:underline">View All</Link>
              </div>
              
              <div className="space-y-4">
                {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 shadow-sm bg-white relative overflow-hidden transition-all hover:shadow-md">
                    <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${event.is_live ? 'bg-green-500' : 'bg-[#0B2A5B]'}`}></div>
                    <div className={`${event.is_live ? 'bg-green-500' : 'bg-[#0B2A5B]'} text-white rounded-lg p-2 text-center min-w-[55px] ml-2 flex flex-col items-center justify-center shadow-inner`}>
                      <span className="text-xl font-bold leading-none mb-1">{new Date(event.scheduled_at || event.start_time || Date.now()).getDate().toString().padStart(2, '0')}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider">{new Date(event.scheduled_at || event.start_time || Date.now()).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 px-1">
                      <div className="text-sm font-bold text-gray-800 mb-0.5">{event.title || "Live Session"}</div>
                      <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1">
                        <Clock className="h-3 w-3 text-[#0B2A5B] inline"/> 
                        {new Date(event.scheduled_at || event.start_time || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <Link to={`/teacher/lectures/${event.id}`}>
                      <Button size="sm" className={`${event.is_live ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'} h-8 text-xs font-semibold px-4 rounded-lg shadow-sm`}>
                        {event.is_live ? 'Join' : 'Manage'}
                      </Button>
                    </Link>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500 py-4 text-center">No lectures scheduled for this date.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
