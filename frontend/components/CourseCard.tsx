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
      'Publication': 'bg-purple-100 text-purple-700',
      'Health': 'bg-green-100 text-green-700',
      'Environment': 'bg-emerald-100 text-emerald-700',
      'Cultural': 'bg-pink-100 text-pink-700',
      'Political/Social': 'bg-blue-100 text-blue-700',
      'Media': 'bg-orange-100 text-orange-700',
      'Professional/Business': 'bg-indigo-100 text-indigo-700',
      'Food': 'bg-yellow-100 text-yellow-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('open')) return 'bg-green-100 text-green-700';
    if (status.toLowerCase().includes('waitlist')) return 'bg-yellow-100 text-yellow-700';
    if (status.toLowerCase().includes('closed')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Get primary section for display
  const primarySection = course.sections[0];
  const sectionCount = course.sections.length;
  const facilitatorCount = course.facilitators.length;

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
        {primarySection && (
          <>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{primarySection.day} {primarySection.time}</span>
              {sectionCount > 1 && (
                <Badge className="bg-gray-100 text-gray-700">+{sectionCount - 1} more</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{primarySection.room}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4" />
              <Badge className={getStatusColor(primarySection.enrollment_status)}>
                {primarySection.enrollment_status}
              </Badge>
            </div>
          </>
        )}
      </div>

      {facilitatorCount > 0 && (
        <p className="text-gray-600 mb-4 text-sm">
          {course.facilitators.slice(0, 2).map(f => f.name).join(', ')}
          {facilitatorCount > 2 && ` +${facilitatorCount - 2} more`}
        </p>
      )}

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
