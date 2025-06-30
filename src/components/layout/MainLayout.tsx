import React from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const hideFooter = pathname.includes('/interview/session');
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;