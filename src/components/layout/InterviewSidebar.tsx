import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  UserCircle, 
  Calendar, 
  BookOpen, 
  FileText, 
  Users,
  MessageSquare,
  Mail,
  LogOut,
  Code
} from 'lucide-react';

interface InterviewSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const InterviewSidebar: React.FC<InterviewSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const sidebarLinks = [
    { icon: <UserCircle size={20} />, label: 'Profile', path: '/interview/profile' },
    { icon: <Calendar size={20} />, label: 'Schedule Mock Interview', path: '/interview/schedule' },
    { icon: <Code size={20} />, label: 'Coding Test', path: '/interview/coding-test' },
    { icon: <BookOpen size={20} />, label: 'Blogs', path: '/interview/blogs' },
    { icon: <FileText size={20} />, label: 'Resume Analyzer', path: '/resume' },
    { icon: <Users size={20} />, label: 'Become Affiliate', path: '/interview/affiliate' },
    { icon: <MessageSquare size={20} />, label: 'Feedback', path: '/interview/feedback' },
    { icon: <Mail size={20} />, label: 'Write to Us', path: '/interview/contact' },
    { icon: <LogOut size={20} />, label: 'Logout', path: '/logout' },
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

export default InterviewSidebar;
