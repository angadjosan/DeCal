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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="mb-2">
        <Badge className={getCategoryColor(course.category)}>
          {course.category}
        </Badge>
      </div>

      <h3 className="text-[#003262] text-lg mb-1">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-3">
        {course.department} • {course.units} {course.units === 1 ? 'unit' : 'units'}
      </p>

      <div className="mb-3">
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
            <div className="flex items-center gap-1.5">
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
