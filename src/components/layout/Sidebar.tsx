import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarClock, 
  FileText, 
  Settings, 
  BookOpen,
  History,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

type Course = {
  id: number;
  type: 'Technical' | 'Functional';
  title: string;
  instructor: string;
  image?: string;
};

const courses: Course[] = [
  {
    id: 1,
    type: 'Technical',
    title: 'React & TypeScript Mastery',
    instructor: 'Jane Doe',
  },
  {
    id: 2,
    type: 'Functional',
    title: 'Business Process Mapping',
    instructor: 'John Smith',
  },
  {
    id: 3,
    type: 'Technical',
    title: 'REST APIs with Node.js',
    instructor: 'Alice Johnson',
  },
  {
    id: 4,
    type: 'Functional',
    title: 'SAP Functional Overview',
    instructor: 'Michael Green',
  },
  {
    id: 5,
    type: 'Functional',
    title: 'SAP Functional Overview',
    instructor: 'Michael Green',
  },
  {
    id: 6,
    type: 'Functional',
    title: 'SAP Functional Overview',
    instructor: 'Michael Green',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ }) => {
  const location = useLocation();
  
  const sidebarLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <CalendarClock size={20} />, label: 'Practice Session', path: '/create-session' },
    { icon: <History size={20} />, label: 'My Sessions', path: '/sessions' },
    { icon: <FileText size={20} />, label: 'My Resumes', path: '/resumes' },
    { icon: <Award size={20} />, label: 'Progress', path: '/progress' },
    { icon: <BookOpen size={20} />, label: 'Resources', path: '/resources' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];
  
  // Determine sidebar classes based on isOpen state
  // const sidebarClasses = `bg-white h-[calc(100vh-4rem)] transition-all duration-300 border-r shadow-sm fixed top-16 left-0 ${
  //   isOpen ? 'w-64' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
  // }`;
  const sidebarClasses = 'w-40 bg-slate-800 rounded-xl';
  
  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col overflow-y-auto w-">
        <div className="p-4">
          <div className="flex flex-col gap-2">
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
                        {courses.map((course) => (
                      <div
                          key={course.id}
                          className="flex items-center gap-3 border p-3 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                    {/* <img
                      src={course.image}
                      alt={course.title}
                      className="w-14 h-14 object-cover rounded"
                    /> */}
                    <div>
                      <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        course.type === 'Technical'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                      }`}
                      >
                      {course.type}
                      </span>
                    <p className="text-sm font-medium text-gray-300 mt-1">
                        {course.title}
                      </p>
                        <p className="text-xs text-gray-400">By {course.instructor}</p>
                    </div>
                  </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Sidebar;
