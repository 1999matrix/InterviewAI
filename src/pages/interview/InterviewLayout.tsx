import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import InterviewSidebar from '../../components/layout/InterviewSidebar';

const InterviewLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white h-16 border-b flex items-center fixed w-full z-50">
        <div className="flex px-4 w-full justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="p-2 mr-2 rounded-md hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold">Interview Prep</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* You can add user avatar, notifications, etc. here */}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <InterviewSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className={`pt-20 transition-all duration-300 ${
        isSidebarOpen ? 'md:pl-64' : 'md:pl-20'
      }`}>
        <div className="px-4 md:px-6 pb-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InterviewLayout; 