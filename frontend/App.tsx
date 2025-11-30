import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CoursesPage } from './components/CoursesPage';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';
import { StaticPages } from './components/StaticPages';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';
import { createClient, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Protected Route Component that shows toast when redirecting
function ProtectedRoute({ isLoggedIn, children }: { isLoggedIn: boolean; children: React.ReactNode }) {
  if (!isLoggedIn) {
    toast.error('Please log in to submit a DeCal', {
      duration: 4000,
    });
    return <Navigate to="/courses" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");

  // Load initial session and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Google login (called from navigation if needed)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/courses`,
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      console.error("Google login failed:", error.message);
    }
  };

  // Sign out
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        handleGoogleLogin={handleGoogleLogin}
        handleLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/courses" element={<CoursesPage />} /> 
        <Route path="/submit" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <SubmissionForm session={session} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<StaticPages page="about" />} />
        <Route path="/faq" element={<StaticPages page="faq" />} />
        <Route path="/facilitate" element={<StaticPages page="facilitate" />} />
      </Routes>
      <Toaster />
    </div>
  );
}
