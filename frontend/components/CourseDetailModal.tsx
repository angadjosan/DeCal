import { X, Users, Calendar, MapPin, ExternalLink, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Course } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
  if (!course) return null;

  // Check if any section is open for enrollment
  const hasOpenSection = course.sections.some(s => 
    s.enrollment_status.toLowerCase().includes('open')
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-[#003262]">{course.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {course.description}
        </DialogDescription>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-gray-600">
              {course.department} • {course.semester} • {course.units} {course.units === 1 ? 'unit' : 'units'}
            </p>
            {course.enrollment_information && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">{course.enrollment_information}</p>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Description</h3>
            </div>
            <p className="text-gray-700">{course.description}</p>
          </div>

          {/* Instructors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Instructors</h3>
            </div>
            <div className="space-y-1">
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
                <p className="text-gray-700 mt-2">
                  <strong>Faculty Sponsor:</strong> {course.faculty_sponsor_name}
                </p>
              )}
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Sections</h3>
            </div>
            {course.sections.length > 0 ? (
              <div className="space-y-3">
                {course.sections.map((section, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-700 font-medium">
                          {section.day} at {section.time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <p className="text-gray-600 text-sm">{section.room}</p>
                        </div>
                        {section.notes && (
                          <p className="text-gray-600 text-sm mt-1">{section.notes}</p>
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

          {/* Application */}
          {course.application_url && (
            <div>
              <h3 className="text-[#003262] mb-3">Application</h3>
              {course.application_due_date && (
                <p className="text-gray-700 mb-2">Due: {course.application_due_date}</p>
              )}
              {course.time_to_complete && (
                <p className="text-gray-600 text-sm mb-3">Est. time: {course.time_to_complete} minutes</p>
              )}
              <Button 
                variant="outline" 
                className="border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white"
                onClick={() => window.open(course.application_url, '_blank')}
              >
                Apply Now →
              </Button>
            </div>
          )}

          {/* Contact */}
          {course.contact_email && (
            <div>
              <h3 className="text-[#003262] mb-3">Contact</h3>
              <a 
                href={`mailto:${course.contact_email}`}
                className="text-blue-600 hover:underline"
              >
                {course.contact_email}
              </a>
            </div>
          )}

          {/* Course Website */}
          {course.website && (
            <div>
              <h3 className="text-[#003262] mb-3">Course Website</h3>
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
      </DialogContent>
    </Dialog>
  );
}
