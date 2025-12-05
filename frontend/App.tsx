import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CoursesPage } from './components/CoursesPage';
import { CourseDetailsPage } from './components/CourseDetailsPage';
import { SubmissionForm } from './components/SubmissionForm';
import { AdminDashboard } from './components/AdminDashboard';
import { StaticPages } from './components/StaticPages';
import { NotFound } from './components/NotFound';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';
import { createClient, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Protected Route Component that shows toast when redirecting
function ProtectedRoute({ isLoggedIn, loading, children }: { isLoggedIn: boolean; loading: boolean; children: React.ReactNode }) {
  if (loading) {
    return null; // Or a loading spinner
  }
  
  if (!isLoggedIn) {
    toast.error('Please log in to submit a DeCal', {
      duration: 4000,
    });
    // Store the intended destination before redirecting
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/courses" replace />;
  }
  return <>{children}</>;
}

// Admin Protected Route Component
function AdminProtectedRoute({ userRole, children }: { userRole: UserRole; children: React.ReactNode }) {
  if (userRole !== 'admin') {
    return <Navigate to="/courses" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);

  // Load initial session and listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch user profile when session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session) {
        setUserRole("student");
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          setUserRole("student");
          return;
        }

        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.profile.is_admin ? "admin" : "student");
        } else {
          setUserRole("student");
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserRole("student");
      }
    };

    fetchUserProfile();
  }, [session]);

  // Google login (called from navigation if needed)
  const handleGoogleLogin = async () => {
    // Get the intended redirect URL or use current path
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      console.error("Google login failed:", error.message);
    } else {
      // Clear the stored redirect after successful login initiation
      sessionStorage.removeItem('redirectAfterLogin');
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
        <Route path="/details/:id" element={<CourseDetailsPage />} />
        <Route path="/submit" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}>
            <SubmissionForm session={session} />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminProtectedRoute userRole={userRole}>
            <AdminDashboard session={session} />
          </AdminProtectedRoute>
        } />
        <Route path="/about" element={<StaticPages page="about" />} />
        <Route path="/faq" element={<StaticPages page="faq" />} />
        <Route path="/facilitate" element={<StaticPages page="facilitate" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}
