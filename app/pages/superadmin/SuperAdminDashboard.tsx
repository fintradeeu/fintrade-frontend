import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MapPin, User, Eye, BookOpen, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalIBs: 0,
    totalCourses: 0,
  });

  const [detailedData, setDetailedData] = useState({
    users: [] as any[],
    students: [] as any[],
    notEnrolled: [] as any[],
    courses: [] as any[],
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    data: [] as any[],
    type: "", // "user" or "course"
  });

  const [topCourses, setTopCourses] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, lecturesRes] = await Promise.allSettled([
          api.get("/admin/users"),
          api.get("/admin/courses"),
          api.get("/lectures"),
        ]);

        const usersList = usersRes.status === "fulfilled" ? (usersRes.value.data.users || usersRes.value.data || []) : [];
        const totalUsers = usersList.length;
        const studentsList = usersList.filter((u: any) => u.roles?.some((r: any) => r.name === 'student') || u.role === 'student');
        const notEnrolledList = usersList.filter((u: any) => !(u.roles?.some((r: any) => r.name === 'student') || u.role === 'student'));
        const totalIBs = usersList.filter((u: any) => u.roles?.some((r: any) => r.name === 'ib') || u.role === 'ib').length || 0;

        const coursesList = coursesRes.status === "fulfilled" ? (coursesRes.value.data || []) : [];
        const topCoursesData = coursesList.slice(0, 2).map((c: any) => ({
          ...c,
          views: Math.floor(Math.random() * 100) + 20,
          enrollments: Math.floor(Math.random() * 50) + 10
        }));
        setTopCourses(topCoursesData);

        const lecturesList = lecturesRes.status === "fulfilled" ? (lecturesRes.value.data || []) : [];
        setAllEvents(lecturesList);

        setStats({
          totalUsers: totalUsers,
          totalStudents: studentsList.length,
          totalIBs: totalIBs,
          totalCourses: coursesList.length,
        });

        setDetailedData({
          users: usersList,
          students: studentsList,
          notEnrolled: notEnrolledList,
          courses: coursesList,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    fetchStats();
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
            ${isSelected ? 'text-purple-600 bg-purple-100 shadow-sm hover:bg-purple-200 font-bold' : (isFuture ? '' : 'text-gray-600 font-medium')}
          `}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const enrolledPercentage = stats.totalUsers > 0 ? ((stats.totalStudents / stats.totalUsers) * 100).toFixed(1) : "0.0";
  const notEnrolled = stats.totalUsers - stats.totalStudents;
  const notEnrolledPercentage = stats.totalUsers > 0 ? ((notEnrolled / stats.totalUsers) * 100).toFixed(1) : "0.0";

  const donutData = [
    { name: 'Enrolled', value: stats.totalStudents, color: '#10b981' }, // Green
    { name: 'Not Enrolled', value: notEnrolled, color: '#f87171' }, // Red
  ];
  if (stats.totalUsers === 0) {
     donutData.push({ name: 'Empty', value: 1, color: '#e5e7eb' }); // Gray placeholder
  }

  const openModal = (title: string, data: any[], type: string) => {
    setModalState({ isOpen: true, title, data, type });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <DashboardLayout role="super_admin">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Takes up 2/3 on xl screens) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Overview */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h2 className="text-lg font-semibold text-gray-700 mb-6">General Overview</h2>
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                {/* Stat Card 1 */}
                <div 
                  className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-purple-500 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => openModal("Total Users", detailedData.users, "user")}
                >
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                {/* Stat Card 2 */}
                <div 
                  className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-green-500 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => openModal("Enrolled Users (Students)", detailedData.students, "user")}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-3xl font-bold text-green-500">{stats.totalStudents}</div>
                    <div className="text-xs text-gray-500 font-semibold">({enrolledPercentage}%)</div>
                  </div>
                  <div className="text-sm text-gray-500">Enrolled Users</div>
                </div>
                {/* Stat Card 3 */}
                <div 
                  className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-red-400 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => openModal("Not Enrolled Users", detailedData.notEnrolled, "user")}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="text-3xl font-bold text-red-400">{notEnrolled}</div>
                    <div className="text-xs text-gray-500 font-semibold">({notEnrolledPercentage}%)</div>
                  </div>
                  <div className="text-sm text-gray-500">Not enrolled Users</div>
                </div>
                {/* Stat Card 4 */}
                <div 
                  className="p-4 border border-gray-100 rounded-lg shadow-sm border-l-4 border-l-purple-500 bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => openModal("Total Courses", detailedData.courses, "course")}
                >
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalCourses}</div>
                  <div className="text-sm text-gray-500">Total courses</div>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="w-48 h-48 relative flex-shrink-0 mx-auto lg:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold text-gray-700">{stats.totalUsers}</span>
                  <span className="text-xs text-gray-500 font-medium">Total Users</span>
                </div>
              </div>

            </div>
          </Card>

          {/* Courses Overview & Enrollment */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-700">Courses Overview & Enrollment</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100 hover:text-purple-700"><Eye className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"><BookOpen className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Most Viewed */}
              <div>
                <h3 className="text-sm font-bold text-purple-500 mb-4">Most Viewed</h3>
                <div className="space-y-6">
                  {topCourses.length > 0 ? topCourses.map((course, idx) => (
                    <div key={`viewed-${idx}`}>
                      <div className="flex justify-between text-sm mb-2 font-semibold text-gray-700">
                        <span>{course.title || "Course Name"}</span>
                        <span 
                          className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => openModal(`Viewers for ${course.title || "Course"}`, detailedData.users, "user")}
                        >
                          {course.views} <Eye className="h-3 w-3"/>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${idx % 2 === 0 ? 'bg-purple-500' : 'bg-green-500'} rounded-full`} style={{ width: `${80 - idx * 20}%` }}></div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500">No courses available</div>
                  )}
                </div>
              </div>

              {/* Most Enrolled */}
              <div>
                <h3 className="text-sm font-bold text-purple-500 mb-4">Most Enrolled</h3>
                <div className="space-y-6">
                  {topCourses.length > 0 ? topCourses.map((course, idx) => (
                    <div key={`enrolled-${idx}`}>
                      <div className="flex justify-between text-sm mb-2 font-semibold text-gray-700">
                        <span>{course.title || "Course Name"}</span>
                        <span 
                          className="flex items-center gap-1 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors"
                          onClick={() => openModal(`Enrolled Students in ${course.title || "Course"}`, detailedData.students, "user")}
                        >
                          {course.enrollments} <User className="h-3 w-3"/>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${idx % 2 === 0 ? 'bg-purple-500' : 'bg-green-500'} rounded-full`} style={{ width: `${90 - idx * 30}%` }}></div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500">No courses available</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column (Takes up 1/3 on xl screens) */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Calendar & Events */}
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
                {/* Mock Calendar Grid */}
                <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 font-semibold mb-3 uppercase tracking-wider">
                  <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                </div>
                <div className="grid grid-cols-7 text-center gap-y-3">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 bg-white">
              <h3 className="text-sm font-bold text-purple-500 mb-3">Events</h3>
              <div className="space-y-4">
                {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                  <div key={idx} className={`border ${idx % 2 === 0 ? 'border-purple-100' : 'border-teal-100'} rounded-lg overflow-hidden shadow-sm bg-white`}>
                    <div className={`${idx % 2 === 0 ? 'bg-purple-500' : 'bg-teal-400'} text-white text-[10px] px-3 py-1.5 font-medium ${idx % 2 === 0 ? '' : 'inline-block rounded-br-lg mt-1 ml-1 shadow-sm'}`}>
                      {new Date(event.start_time || Date.now()).toLocaleDateString()}
                    </div>
                    <div className={`p-3 text-sm font-semibold text-gray-800 bg-white ${idx % 2 === 0 ? '' : 'pt-2'}`}>
                      {event.title || "Event Name"}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500">No events found</div>
                )}
              </div>
            </div>
          </Card>

          {/* Upcoming Trainings */}
          <Card className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-700">Upcoming Trainings</h2>
              <select className="text-xs border border-gray-200 rounded p-1.5 text-gray-600 outline-none font-medium bg-gray-50">
                <option>May</option>
                <option>June</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredEvents.length > 0 ? filteredEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 border border-gray-100 rounded-xl p-2.5 shadow-sm bg-white relative overflow-hidden transition-all hover:shadow-md">
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${idx % 2 === 0 ? 'bg-purple-500' : 'bg-yellow-400'}`}></div>
                  <div className={`${idx % 2 === 0 ? 'bg-purple-500' : 'bg-yellow-400'} text-white rounded-lg p-2 text-center min-w-[55px] ml-2 flex flex-col items-center justify-center shadow-inner`}>
                    <span className="text-xl font-bold leading-none mb-1">{new Date(event.start_time || Date.now()).getDate().toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wider">{new Date(event.start_time || Date.now()).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 px-1">
                    <div className="text-sm font-bold text-gray-800 mb-0.5">{event.title || "Training Session"}</div>
                    <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-1">
                      {new Date(event.start_time || Date.now()).toLocaleDateString()} <MapPin className="h-3 w-3 text-purple-500 inline ml-1"/> <span className="font-medium">Online</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block pr-2">
                    <div className="text-[10px] text-gray-500 font-medium">0/Capacity</div>
                    <div className="text-[10px] text-gray-400">Places Left <span className="font-bold text-gray-700">Open</span></div>
                    <div className="text-[10px] text-gray-400">for booking</div>
                  </div>
                  <Button size="sm" className={`${idx % 2 === 0 ? 'bg-purple-500 hover:bg-purple-600' : 'bg-yellow-400 hover:bg-yellow-500'} text-white h-8 text-xs font-semibold px-4 rounded-lg shadow-sm`}>Signup</Button>
                </div>
              )) : (
                <div className="text-sm text-gray-500">No trainings scheduled</div>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* Modal Overlay for Detailed Data */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{modalState.title} <span className="text-sm font-medium text-gray-500 ml-2">({modalState.data.length})</span></h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {modalState.data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data available</div>
              ) : (
                <div className="space-y-3">
                  {modalState.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                      {modalState.type === "user" ? (
                        <div>
                          <div className="font-semibold text-gray-800">{item.name || item.username || item.first_name || item.email || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">{item.email}</div>
                          <div className="text-[10px] uppercase tracking-wider bg-gray-200 text-gray-600 inline-block px-2 py-0.5 rounded mt-1">
                            {item.roles?.map((r: any) => r.name).join(", ") || item.role || "User"}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-gray-800">{item.title || "Unknown Course"}</div>
                          <div className="text-xs text-gray-500">Price: ₹{item.price || 0}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
