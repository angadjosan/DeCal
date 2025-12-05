import { Users, Calendar, MapPin, ExternalLink, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Course } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { RichTextViewer } from './ui/rich-text-editor';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{course.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {course.description}
        </DialogDescription>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-[#003262] mb-2">{course.title}</h2>
            <p className="text-gray-600">
              {course.semester} | {course.department}
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Course Details */}
          <div>
            <h3 className="text-[#003262] mb-3">Course Details</h3>
            <p className="text-gray-700 mb-4">{course.description}</p>
            
            {course.website && (
              <p className="text-gray-700">
                Website: <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {course.website}
                </a>
              </p>
            )}
          </div>

          {/* Enrollment Information */}
          {(course.application_url || course.application_due_date || course.enrollment_information) && (
            <div>
              <h3 className="text-[#003262] mb-3">Enrollment Information</h3>
              {course.enrollment_information && (
                <p className="text-gray-700 mb-2">
                  Enrollment Information: {course.enrollment_information}
                </p>
              )}
              {course.application_url && (
                <p className="text-gray-700 mb-2">
                  Application URL: <a href={course.application_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {course.application_url}
                  </a>
                </p>
              )}
              {course.application_due_date && (
                <p className="text-gray-700">
                  Application Due Date: {new Date(course.application_due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Sections */}
          {course.sections.length > 0 && (
            <div>
              <h3 className="text-[#003262] mb-3">Course Sections</h3>
              <div className="space-y-3">
                {course.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="text-gray-900">{section.section_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Day & Time:</span>
                        <p className="text-gray-900">{section.day} at {section.time}</p>
                      </div>
                      {section.room && (
                        <div>
                          <span className="text-gray-600">Room:</span>
                          <p className="text-gray-900">{section.room}</p>
                        </div>
                      )}
                      {section.capacity && (
                        <div>
                          <span className="text-gray-600">Capacity:</span>
                          <p className="text-gray-900">{section.capacity}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Enrollment:</span>
                        <p className="text-gray-900">{section.enrollment_status}</p>
                      </div>
                      {(section.ccn_ld || section.ccn_ud) && (
                        <div>
                          <span className="text-gray-600">CCN:</span>
                          <p className="text-gray-900">
                            {section.ccn_ld && `LD: ${section.ccn_ld}`}
                            {section.ccn_ld && section.ccn_ud && ' | '}
                            {section.ccn_ud && `UD: ${section.ccn_ud}`}
                          </p>
                        </div>
                      )}
                      {section.notes && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Notes:</span>
                          <p className="text-gray-900">{section.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus */}
          <div>
            <h3 className="text-[#003262] mb-3">Syllabus</h3>
            {course.syllabus ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                <RichTextViewer content={course.syllabus} className="text-gray-700" />
              </div>
            ) : (
              <p className="text-gray-500">No syllabus provided</p>
            )}
          </div>

          {/* Facilitators */}
          <div>
            <h3 className="text-[#003262] mb-3">Facilitators</h3>
            <p className="text-gray-700">
              Faculty Sponsor: {course.faculty_sponsor_name} ({course.faculty_sponsor_email})
            </p>
            <p className="text-gray-700">
              Contact Email: {course.contact_email}
            </p>
            <br />
            {course.facilitators.length > 0 ? (
              <div className="space-y-3 mt-3">
                {course.facilitators.map((facilitator, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="text-gray-900">{facilitator.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="text-gray-900">{facilitator.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mt-3">No facilitators listed</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
