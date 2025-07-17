import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, DollarSign, LogIn, Menu, X, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import UserProfile from '../auth/UserProfile';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <nav className="bg-white shadow-sm py-2 fixed w-full top-0 z-50">
      <div className="container mx-auto px-2 md:px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <Logo />
          <span className="text-lg font-bold text-blue-600">BrOne.ai</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLinks />
          
          <div className="flex items-center space-x-2">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <UserProfile compact={true} />
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ease-in-out">
          <div className="flex flex-col space-y-4">
            <MobileNavLinks closeMenu={() => setIsMenuOpen(false)} />
            
            {isAuthenticated && user ? (
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                  <UserProfile compact={true} />
                </div>
                <div className="flex flex-col space-y-2">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" fullWidth>Dashboard</Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    fullWidth
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth>Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button fullWidth>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

const NavLinks: React.FC = () => (
  <div className="flex items-center space-x-4">
    <Link to="/interview/home" className="nav-link group">
      <div className="flex items-center">
        <Brain className="w-4 h-4 mr-1 text-blue-500" />
        <span className="text-base text-stone-700">Interview Preperation</span>
      </div>
      <div className="nav-indicator"></div>
    </Link>
    <Link to="/resume" className="nav-link group">
      <div className="flex items-center">
        <FileText className="w-4 h-4 mr-1 text-blue-500" />
        <span className="text-base text-stone-700">ATS Resume</span>
      </div>
      <div className="nav-indicator"></div>
    </Link>
    <Link to="/pricing" className="nav-link group">
      <div className="flex items-center">
        <DollarSign className="w-4 h-4 mr-1 text-blue-500" />
        <span className="text-base text-stone-700">Pricing</span>
      </div>
      <div className="nav-indicator"></div>
    </Link>
  </div>
);

const MobileNavLinks: React.FC<{ closeMenu: () => void }> = ({ closeMenu }) => (
  <>
    <Link 
      to="/interview/profile" 
      className="py-2 text-gray-700 hover:text-blue-600 transition-colors"
      onClick={closeMenu}
    >
      <div className="flex items-center">
        <Brain className="w-5 h-5 mr-2" />
        <span>Interview Preparation</span>
      </div>
    </Link>
    <Link 
      to="/resume" 
      className="py-2 text-gray-700 hover:text-blue-600 transition-colors"
      onClick={closeMenu}
    >
      <div className="flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        <span>ATS Resume</span>
      </div>
    </Link>
    <Link 
      to="/pricing" 
      className="py-2 text-gray-700 hover:text-blue-600 transition-colors"
      onClick={closeMenu}
    >
      <div className="flex items-center">
        <DollarSign className="w-5 h-5 mr-2" />
        <span>Pricing</span>
      </div>
    </Link>
  </>
);

export default Navbar;