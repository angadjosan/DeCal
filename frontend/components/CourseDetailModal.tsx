import { X, Users, Calendar, MapPin, ExternalLink, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Course } from '../types';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface CourseDetailModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseDetailModal({ course, isOpen, onClose }: CourseDetailModalProps) {
  if (!course) return null;

  const canEnroll = course.status === 'Open' && course.enrolled < course.capacity;
  const canWaitlist = course.status === 'Waitlist' || course.enrolled >= course.capacity;

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
            <div className="mt-4">
              {canEnroll && (
                <Button className="bg-[#003262] hover:bg-[#003262]/90 w-full md:w-auto">
                  Enroll Now
                </Button>
              )}
              {canWaitlist && (
                <Button className="bg-[#FDB515] text-[#003262] hover:bg-[#FDB515]/90 w-full md:w-auto">
                  Join Waitlist
                </Button>
              )}
            </div>
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
              {course.facilitators.map((facilitator, index) => (
                <p key={index} className="text-gray-700">• {facilitator}</p>
              ))}
              <p className="text-gray-700">Faculty Sponsor: {course.facultySponsor}</p>
            </div>
          </div>

          {/* Meeting Times */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Meeting Times</h3>
            </div>
            <p className="text-gray-700">{course.meetingTimes}</p>
            {course.startDate && course.endDate && (
              <p className="text-gray-600 text-sm mt-1">
                Start: {course.startDate} | End: {course.endDate}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Location</h3>
            </div>
            <p className="text-gray-700">{course.location}</p>
          </div>

          {/* Enrollment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[#003262]" />
              <h3 className="text-[#003262]">Enrollment</h3>
            </div>
            <p className="text-gray-700">{course.enrolled}/{course.capacity} enrolled</p>
            <p className="text-gray-700">Status: <span className={
              course.status === 'Open' ? 'text-green-600' : 
              course.status === 'Waitlist' ? 'text-yellow-600' : 
              'text-red-600'
            }>{course.status}</span></p>
          </div>

          {/* Application */}
          {course.applicationUrl && (
            <div>
              <h3 className="text-[#003262] mb-3">Application</h3>
              <p className="text-gray-700 mb-2">Due: {course.applicationDue}</p>
              <p className="text-gray-600 text-sm mb-3">Est. time: {course.applicationTime} minutes</p>
              <Button 
                variant="outline" 
                className="border-[#003262] text-[#003262] hover:bg-[#003262] hover:text-white"
                onClick={() => window.open(course.applicationUrl, '_blank')}
              >
                Apply Now →
              </Button>
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
