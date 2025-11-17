import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'student' | 'facilitator' | 'admin') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    // Simulate login - in a real app this would use OAuth
    // For demo purposes, randomly assign a role
    const roles: Array<'student' | 'facilitator' | 'admin'> = ['student', 'facilitator', 'admin'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    onLogin(randomRole);
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-[#003262] rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">D</span>
          </div>

          {/* Title */}
          <h2 className="text-[#003262] mb-2">Welcome to DeCal</h2>
          <p className="text-gray-600 mb-8">Course Management System</p>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-[#003262] hover:bg-[#003262]/90 h-12 mb-6"
          >
            <Lock className="h-5 w-5 mr-2" />
            Continue with Berkeley Google
          </Button>

          <p className="text-sm text-gray-500 mb-6">
            🔐 @berkeley.edu accounts only
          </p>

          {/* Info */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">New to DeCals?</p>
            <button className="text-sm text-[#003262] hover:underline">
              Learn More →
            </button>
          </div>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-700">
              <strong>Demo Mode:</strong> Click the login button to access the application. 
              You'll be randomly assigned a role (student, facilitator, or admin) to explore different views.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
