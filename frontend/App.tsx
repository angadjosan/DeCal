import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { CoursesPage } from './components/CoursesPage';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { StaticPages } from './components/StaticPages';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('courses');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage('courses');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'courses':
        return <CoursesPage />;
      case 'submit':
        return <SubmissionForm />;
      case 'admin':
        return <AdminDashboard />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'about':
        return <StaticPages page="about" />;
      case 'faq':
        return <StaticPages page="faq" />;
      case 'facilitate':
        return <StaticPages page="facilitate" />;
      default:
        return <CoursesPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
      />
      {renderPage()}
      <Toaster />
    </div>
  );
}
