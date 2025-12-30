import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import logo from '../assets/logo.png';

interface NavigationProps {
  isLoggedIn?: boolean;
  userRole?: 'student' | 'facilitator' | 'admin';
  handleGoogleLogin: () => void;
  handleLogout?: () => void;
}

export function Navigation({ isLoggedIn = false, userRole, handleGoogleLogin, handleLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Courses', path: '/courses' }
  ];

  const resourcesItems = [
    { label: 'FAQ', path: '/faq' },
    { label: 'How to Facilitate', path: '/facilitate' }
  ];

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#003262] border-b border-[#003262]/20">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/courses" className="flex items-center">
          <img 
            src={logo}
            alt="DeCal @ Berkeley" 
            className="h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-white/80 hover:text-white transition-colors ${
                location.pathname === item.path ? 'text-white' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                Resources
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {resourcesItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Submit a DeCal Link */}
          <Link
            to="/submit"
            className={`text-white/80 hover:text-white transition-colors ${
              location.pathname === '/submit' ? 'text-white' : ''
            }`}
          >
            Submit a DeCal
          </Link>

          {/* Admin Dashboard Link - Only visible to admins */}
          {userRole === 'admin' && (
            <Link
              to="/admin"
              className={`text-white/80 hover:text-white transition-colors ${
                location.pathname === '/admin' ? 'text-white' : ''
              }`}
            >
              Admin
            </Link>
          )}
          
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {!isLoggedIn && (
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="hidden md:flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login
            </Button>
          )}
          
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-2 focus:outline-none">
                  <div className="w-8 h-8 bg-[#FDB515] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FDB515]/90 transition-colors">
                    <User className="h-4 w-4 text-[#003262]" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMobileMenuClose}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 mb-2 ${
                      location.pathname === item.path ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Resources Dropdown in Mobile */}
                <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen} className="mb-2">
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-gray-100 text-gray-700">
                    <span>Resources</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 mt-1 flex flex-col">
                    {resourcesItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleMobileMenuClose}
                        className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full block mb-1 ${
                          location.pathname === item.path ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Submit a DeCal in Mobile */}
                <Link
                  to="/submit"
                  onClick={handleMobileMenuClose}
                  className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full block mb-2 ${
                    location.pathname === '/submit' ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                  }`}
                >
                  Submit a DeCal
                </Link>

                {/* Admin Dashboard in Mobile - Only visible to admins */}
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={handleMobileMenuClose}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full block mb-2 ${
                      location.pathname === '/admin' ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Login/Logout Button in Mobile */}
                {!isLoggedIn ? (
                  <Button
                    onClick={() => {
                      handleGoogleLogin();
                      handleMobileMenuClose();
                    }}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 mt-6"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Login
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleLogout?.();
                      handleMobileMenuClose();
                    }}
                    variant="outline"
                    className="w-full mt-6"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
