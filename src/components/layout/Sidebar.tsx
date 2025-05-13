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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
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
  const sidebarClasses = `bg-white h-[calc(100vh-4rem)] transition-all duration-300 border-r shadow-sm fixed top-16 left-0 z-40 ${
    isOpen ? 'w-64' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'
  }`;
  
  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="p-4">
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {link.icon}
                    </div>
                    <span className={`ml-3 ${isOpen ? 'block' : 'hidden md:hidden'}`}>
                      {link.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;