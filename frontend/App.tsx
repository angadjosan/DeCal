import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CoursesPage } from './components/CoursesPage';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { StaticPages } from './components/StaticPages';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');

  const handleLogin = (role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        isLoggedIn={isLoggedIn}
        userRole={userRole}
      />
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/submit" element={<SubmissionForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/about" element={<StaticPages page="about" />} />
        <Route path="/faq" element={<StaticPages page="faq" />} />
        <Route path="/facilitate" element={<StaticPages page="facilitate" />} />
      </Routes>
      <Toaster />
    </div>
  );
}
