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

interface NavigationProps {
  isLoggedIn?: boolean;
  userRole?: 'student' | 'facilitator' | 'admin';
}

export function Navigation({ isLoggedIn = false, userRole }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Courses', path: '/courses' },
    { label: 'Submit a DeCal', path: '/submit' }
  ];

  const resourcesItems = [
    { label: 'About', path: '/about' },
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
            src="/logo-e8ca9a3ce20b1618fbefe1cedce265e61b2b508e5ce38c3aaf7a236e1740f5b8.png" 
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

          {/* Admin Dashboard 
          <Link
            to="/admin"
            className={`text-white/80 hover:text-white transition-colors ${
              location.pathname === '/admin' ? 'text-white' : ''
            }`}
          >
            Admin Dashboard (TEMPORARY)
          </Link>
          */}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FDB515] rounded-full flex items-center justify-center cursor-pointer">
                <User className="h-4 w-4 text-[#003262]" />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMobileMenuClose}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 ${
                      location.pathname === item.path ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Resources Section in Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">Resources</div>
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleMobileMenuClose}
                      className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full block ${
                        location.pathname === item.path ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Admin Dashboard in Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <Link
                    to="/admin"
                    onClick={handleMobileMenuClose}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full block ${
                      location.pathname === '/admin' ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    Admin Dashboard (TEMPORARY)
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
