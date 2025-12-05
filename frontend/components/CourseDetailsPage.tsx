import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ExternalLink, FileText, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Course } from '../types';
import { toast } from 'sonner';
import { RichTextViewer } from './ui/rich-text-editor';

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError('Invalid course ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/courses/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Course not found');
          } else {
            throw new Error('Failed to fetch course');
          }
          setIsLoading(false);
          return;
        }

        const result = await response.json();
        
        if (result.success && result.course) {
          setCourse(result.course);
        } else {
          setError('Course not found');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Course not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or is no longer available.
          </p>
          <Link to="/courses">
            <Button className="bg-[#003262] hover:bg-[#002147] text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link 
        to="/courses" 
        className="inline-flex items-center text-[#003262] hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <Badge className={getCategoryColor(course.category)}>
            {course.category}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold text-[#003262] mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">
          {course.department} • {course.semester} • {course.units} {course.units === 1 ? 'unit' : 'units'}
        </p>

        {course.enrollment_information && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">{course.enrollment_information}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-[#003262]" />
          <h2 className="text-xl font-semibold text-[#003262]">Description</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{course.description}</p>
      </div>

      {/* Instructors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-[#003262]" />
          <h2 className="text-xl font-semibold text-[#003262]">Instructors</h2>
        </div>
        <div className="space-y-2">
          {course.facilitators.length > 0 ? (
            course.facilitators.map((facilitator, index) => (
              <p key={index} className="text-gray-700">
                • {facilitator.name} ({facilitator.email})
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic">No facilitators listed</p>
          )}
          {course.faculty_sponsor_name && (
            <p className="text-gray-700 mt-3 pt-3 border-t border-gray-200">
              <strong>Faculty Sponsor:</strong> {course.faculty_sponsor_name}
            </p>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-[#003262]" />
          <h2 className="text-xl font-semibold text-[#003262]">Sections</h2>
        </div>
        {course.sections.length > 0 ? (
          <div className="space-y-3">
            {course.sections.map((section, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Section Type & Capacity */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-medium">
                        {section.section_type}
                      </Badge>
                      {section.capacity && (
                        <span className="text-sm text-gray-600">
                          Capacity: {section.capacity}
                        </span>
                      )}
                    </div>
                    
                    {/* Time & Location */}
                    <p className="text-gray-900 font-medium mb-1">
                      {section.day} at {section.time}
                    </p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <p className="text-sm">{section.room}</p>
                    </div>
                    
                    {/* Start Date */}
                    {section.start_date && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Starts:</strong> {new Date(section.start_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                    
                    {/* CCN Numbers */}
                    {(section.ccn_ld || section.ccn_ud) && (
                      <div className="flex gap-4 mt-2 text-sm">
                        {section.ccn_ld && (
                          <span className="text-gray-700">
                            <strong>CCN (LD):</strong> {section.ccn_ld}
                          </span>
                        )}
                        {section.ccn_ud && (
                          <span className="text-gray-700">
                            <strong>CCN (UD):</strong> {section.ccn_ud}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {section.notes && (
                      <p className="text-gray-600 text-sm mt-2">{section.notes}</p>
                    )}
                  </div>
                  <Badge className={
                    section.enrollment_status.toLowerCase().includes('open')
                      ? 'bg-green-100 text-green-700'
                      : section.enrollment_status.toLowerCase().includes('waitlist')
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }>
                    {section.enrollment_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No sections available</p>
        )}
      </div>

      {/* Syllabus */}
      {course.syllabus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[#003262]" />
            <h2 className="text-xl font-semibold text-[#003262]">Syllabus</h2>
          </div>
          <RichTextViewer content={course.syllabus} className="text-gray-700" />
        </div>
      )}

      {/* Application */}
      {course.application_url && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#003262] mb-4">Application</h2>
          {course.application_due_date && (
            <p className="text-gray-700 mb-2">
              <strong>Due:</strong> {course.application_due_date}
            </p>
          )}
          {course.time_to_complete && (
            <p className="text-gray-600 text-sm mb-4">
              <strong>Estimated time:</strong> {course.time_to_complete} minutes
            </p>
          )}
          <Button 
            className="bg-[#003262] hover:bg-[#002147] text-white"
            onClick={() => window.open(course.application_url, '_blank')}
          >
            Apply Now →
          </Button>
        </div>
      )}

      {/* Contact & Website */}
      <div className="grid md:grid-cols-2 gap-6">
        {course.contact_email && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#003262] mb-4">Contact</h2>
            <a 
              href={`mailto:${course.contact_email}`}
              className="text-blue-600 hover:underline"
            >
              {course.contact_email}
            </a>
          </div>
        )}

        {course.website && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#003262] mb-4">Course Website</h2>
            <Button 
              variant="outline"
              className="border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white"
              onClick={() => window.open(course.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
