import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Edit, Eye, Loader2, AlertCircle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Course {
  id: number;
  semester: string;
  status: string;
  title: string;
  department: string;
  category: string;
  units: number;
  contact_email: string;
  created_at: string;
}

interface MyCoursesPageProps {
  session: Session | null;
}

export function MyCoursesPage({ session }: MyCoursesPageProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/myCourses', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.error || 'Failed to load your courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [session]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Active':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#003262] mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[#003262] mb-2">My Courses</h1>
          <p className="text-gray-600">
            View and manage all the DeCal courses you've submitted
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any courses yet.
            </p>
            <Button
              onClick={() => navigate('/submit')}
              className="bg-[#003262] hover:bg-[#003262]/90"
            >
              Submit Your First Course
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(course.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {course.status === 'Active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit/${course.id}`)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
