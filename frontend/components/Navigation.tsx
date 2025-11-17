import { useState } from 'react';
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
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn?: boolean;
  userRole?: 'student' | 'facilitator' | 'admin';
}

export function Navigation({ currentPage, onNavigate, isLoggedIn = false, userRole }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Courses', value: 'courses' },
    { label: 'Submit a DeCal', value: 'submit' }
  ];

  const resourcesItems = [
    { label: 'About', value: 'about' },
    { label: 'FAQ', value: 'faq' },
    { label: 'How to Facilitate', value: 'facilitate' }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#003262] border-b border-[#003262]/20">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center cursor-pointer" onClick={() => handleNavigate('courses')}>
          <img 
            src="https://decal.studentorg.berkeley.edu/assets/branding/logo-e8ca9a3ce20b1618fbefe1cedce265e61b2b508e5ce38c3aaf7a236e1740f5b8.png" 
            alt="DeCal @ Berkeley" 
            className="h-10"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavigate(item.value)}
              className={`text-white/80 hover:text-white transition-colors ${
                currentPage === item.value ? 'text-white' : ''
              }`}
            >
              {item.label}
            </button>
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
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => handleNavigate(item.value)}
                  className="cursor-pointer"
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Dashboard */}
          <button
            onClick={() => handleNavigate('admin')}
            className={`text-white/80 hover:text-white transition-colors ${
              currentPage === 'admin' ? 'text-white' : ''
            }`}
          >
            Admin Dashboard (TEMPORARY)
          </button>
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
                  <button
                    key={item.value}
                    onClick={() => handleNavigate(item.value)}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 ${
                      currentPage === item.value ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                {/* Resources Section in Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">Resources</div>
                  {resourcesItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleNavigate(item.value)}
                      className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full ${
                        currentPage === item.value ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Admin Dashboard in Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`text-left p-2 rounded-lg hover:bg-gray-100 w-full ${
                      currentPage === 'admin' ? 'bg-gray-100 text-[#003262]' : 'text-gray-700'
                    }`}
                  >
                    Admin Dashboard (TEMPORARY)
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
