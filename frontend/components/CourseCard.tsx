import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Publication': 'bg-purple-100 text-purple-700 border-purple-200',
      'Health': 'bg-green-100 text-green-700 border-green-200',
      'Environment': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Cultural': 'bg-pink-100 text-pink-700 border-pink-200',
      'Political/Social': 'bg-blue-100 text-blue-700 border-blue-200',
      'Media': 'bg-orange-100 text-orange-700 border-orange-200',
      'Professional/Business': 'bg-slate-100 text-slate-700 border-slate-200',
      'Food': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEnrollmentStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('open')) {
      return 'bg-green-500 hover:bg-green-600 text-white';
    } else if (lowerStatus.includes('waitlist')) {
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    } else {
      return 'bg-red-500 hover:bg-red-600 text-white';
    }
  };

  // Get first section's enrollment status
  const firstSection = course.sections?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Badge className={`border-transparent ${getCategoryColor(course.category)}`}>
          {course.category}
        </Badge>
        {firstSection?.enrollment_status && (
          <Badge className={getEnrollmentStatusColor(firstSection.enrollment_status)}>
            {firstSection.enrollment_status}
          </Badge>
        )}
      </div>

      <h3 className="text-[#003262] text-lg mb-1">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-3">
        {course.department} • {course.units} {course.units === 1 ? 'unit' : 'units'}
      </p>

      <div className="mb-3">
        {course.sections.length > 0 && (
          <p className="text-sm font-medium text-gray-700 mb-2">Sections:</p>
        )}
        <div className="flex items-start gap-3 flex-wrap">
          {/* Sections */}
          {course.sections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {course.sections.slice(0, 3).map((section, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs font-normal bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {section.day} {section.time}
                  </Badge>
                ))}
                {course.sections.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal bg-gray-100 text-gray-600 border-gray-300"
                  >
                    +{course.sections.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Locations */}
          {course.sections.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {[...new Set(course.sections.map(s => s.room))].slice(0, 3).map((room, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs font-normal bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {room}
                  </Badge>
                ))}
                {new Set(course.sections.map(s => s.room)).size > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal bg-gray-100 text-gray-600 border-gray-300"
                  >
                    +{new Set(course.sections.map(s => s.room)).size - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Link to={`/details/${course.id}`}>
        <Button
          variant="outline"
          className="w-full border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white"
        >
          View Details →
        </Button>
      </Link>
    </div>
  );
}
