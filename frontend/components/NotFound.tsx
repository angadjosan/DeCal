import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[#003262]">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link to="/courses">
          <Button className="mt-6 bg-[#003262] hover:bg-[#003262]/90">
            Return to Courses
          </Button>
        </Link>
      </div>
    </div>
  );
}
