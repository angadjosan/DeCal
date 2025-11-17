import { Users, Calendar, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
}

export function CourseCard({ course, onViewDetails }: CourseCardProps) {

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Arts & Creativity': 'bg-purple-100 text-purple-700',
      'Business & Entrepreneurship': 'bg-blue-100 text-blue-700',
      'Health & Wellness': 'bg-green-100 text-green-700',
      'Science & Technology': 'bg-orange-100 text-orange-700',
      'Social Impact': 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-green-100 text-green-700',
      'Waitlist': 'bg-yellow-100 text-yellow-700',
      'Closed': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <Badge className={getCategoryColor(course.category)}>
          {course.category}
        </Badge>
      </div>

      <h3 className="text-[#003262] mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">
        {course.department} • {course.units} {course.units === 1 ? 'unit' : 'units'}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {course.enrolled}/{course.capacity} enrolled
          </span>
          <Badge className={`ml-2 ${getStatusColor(course.status)}`}>
            {course.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{course.meetingTimes}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{course.location}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 text-sm">
        {course.facilitators.join(', ')}
      </p>

      <Button
        onClick={() => onViewDetails(course)}
        variant="outline"
        className="w-full border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white"
      >
        View Details →
      </Button>
    </div>
  );
}
