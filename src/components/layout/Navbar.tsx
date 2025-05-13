import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, DollarSign, LogIn, Menu, X } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="bg-white shadow-sm py-4 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Logo />
          <span className="text-xl font-bold text-blue-600">InterviewAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">
                    <LogIn className="w-4.5 h-4.5 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
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
            
            {isAuthenticated ? (
              <Button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                fullWidth
              >
                Logout
              </Button>
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
    </nav>
  );
};

const NavLinks: React.FC = () => (
  <div className="flex items-center space-x-6">
    <Link to="/interview/profile" className="nav-link group">
      <div className="flex items-center">
        <Brain className="w-4 h-4 mr-1.5" />
        <span>Interview Prep</span>
      </div>
      <div className="nav-indicator"></div>
    </Link>
    <Link to="/resume" className="nav-link group">
      <div className="flex items-center">
        <FileText className="w-4 h-4 mr-1.5" />
        <span>ATS Resume</span>
      </div>
      <div className="nav-indicator"></div>
    </Link>
    <Link to="/pricing" className="nav-link group">
      <div className="flex items-center">
        <DollarSign className="w-4 h-4 mr-1.5" />
        <span>Pricing</span>
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