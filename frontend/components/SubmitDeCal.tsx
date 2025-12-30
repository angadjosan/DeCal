import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const categories = [
  'Publication',
  'Health',
  'Environment',
  'Cultural',
  'Political/Social',
  'Media',
  'Professional/Business',
  'Food'
];

const departments = [
  'Computer Science',
  'English',
  'Economics',
  'Public Health',
  'Sociology',
  'Business',
  'Art Practice',
  'Environmental Science',
  'Psychology',
  'Political Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Philosophy'
];

const semesters = [
  'Fall 2025',
  'Spring 2026',
  'Fall 2026',
  'Spring 2027'
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function SubmitDeCal() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    semester: '',
    department: '',
    category: '',
    units: '',
    description: '',
    courseDescription: '',
    website: '',
    enrollmentInfo: '',
    contactEmail: '',
    facilitators: [''],
    facultySponsorName: '',
    facultySponsorEmail: '',
    meetingDays: [] as string[],
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    applicationUrl: '',
    applicationDue: '',
    syllabusFile: null as File | null,
    cpfFile: null as File | null
  });

  const [validation, setValidation] = useState({
    facultySponsorVerified: false,
    documentsValid: false
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    // Simulate validation
    setTimeout(() => {
      setValidation({
        facultySponsorVerified: true,
        documentsValid: true
      });
      alert('Course submitted successfully! You will receive a confirmation email shortly.');
    }, 1000);
  };

  const addFacilitator = () => {
    setFormData({
      ...formData,
      facilitators: [...formData.facilitators, '']
    });
  };

  const updateFacilitator = (index: number, value: string) => {
    const newFacilitators = [...formData.facilitators];
    newFacilitators[index] = value;
    setFormData({ ...formData, facilitators: newFacilitators });
  };

  const toggleMeetingDay = (day: string) => {
    const newDays = formData.meetingDays.includes(day)
      ? formData.meetingDays.filter(d => d !== day)
      : [...formData.meetingDays, day];
    setFormData({ ...formData, meetingDays: newDays });
  };

  const handleFileUpload = (field: 'syllabusFile' | 'cpfFile', file: File | null) => {
    setFormData({ ...formData, [field]: file });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#003262] mb-2">Submit a DeCal</h1>
          <p className="text-gray-600">
            Share your passion and teach a course at Berkeley
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Visit the <a href="/resources" className="text-[#003262] hover:underline">Resources</a> section to learn about the submission process
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={currentStep >= 1 ? 'text-[#003262]' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-[#003262]' : ''}>Details</span>
            <span className={currentStep >= 3 ? 'text-[#003262]' : ''}>People & Logistics</span>
            <span className={currentStep >= 4 ? 'text-[#003262]' : ''}>Documents</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-[#003262]">Basic Information</h2>

              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to AI and Machine Learning"
                />
              </div>

              <div>
                <Label htmlFor="semester">Semester *</Label>
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(sem => (
                      <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Units *</Label>
                <RadioGroup value={formData.units} onValueChange={(value) => setFormData({ ...formData, units: value })}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="unit1" />
                      <Label htmlFor="unit1">1 unit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="unit2" />
                      <Label htmlFor="unit2">2 units</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pnp" id="pnp" />
                      <Label htmlFor="pnp">P/NP only</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-[#003262]">Course Details</h2>

              <div>
                <Label htmlFor="description">Description * (max 500 words)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your course, learning objectives, and what makes it unique..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.split(' ').filter(w => w).length} / 500 words
                </p>
              </div>

              <div>
                <Label htmlFor="courseDescription">Course Description</Label>
                <p className="text-sm text-gray-600 mt-1 mb-2">
                  A few paragraphs about your class - are there any papers or exams? What is the attendance policy? etc.
                </p>
                <Textarea
                  id="courseDescription"
                  value={formData.courseDescription}
                  onChange={(e) => setFormData({ ...formData, courseDescription: e.target.value })}
                  placeholder="Include details about assessments, attendance policy, course structure..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div>
                <Label htmlFor="enrollmentInfo">Enrollment Information</Label>
                <Textarea
                  id="enrollmentInfo"
                  value={formData.enrollmentInfo}
                  onChange={(e) => setFormData({ ...formData, enrollmentInfo: e.target.value })}
                  placeholder="Describe prerequisites, expected background, etc."
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-[#003262]">People & Logistics</h2>

              <div>
                <Label htmlFor="contactEmail">Your Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="your.email@berkeley.edu"
                />
              </div>

              <div>
                <Label>Facilitator Emails *</Label>
                <div className="space-y-2">
                  {formData.facilitators.map((facilitator, index) => (
                    <Input
                      key={index}
                      type="email"
                      value={facilitator}
                      onChange={(e) => updateFacilitator(index, e.target.value)}
                      placeholder="facilitator@berkeley.edu"
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addFacilitator}>
                    + Add another facilitator
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="facultySponsorName">Faculty Sponsor Name *</Label>
                <Input
                  id="facultySponsorName"
                  value={formData.facultySponsorName}
                  onChange={(e) => setFormData({ ...formData, facultySponsorName: e.target.value })}
                  placeholder="Prof. Jane Smith"
                />
              </div>

              <div>
                <Label htmlFor="facultySponsorEmail">Faculty Sponsor Email *</Label>
                <Input
                  id="facultySponsorEmail"
                  type="email"
                  value={formData.facultySponsorEmail}
                  onChange={(e) => setFormData({ ...formData, facultySponsorEmail: e.target.value })}
                  placeholder="sponsor@berkeley.edu"
                />
              </div>

              <div>
                <Label>Meeting Days *</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={formData.meetingDays.includes(day)}
                        onCheckedChange={() => toggleMeetingDay(day)}
                      />
                      <label htmlFor={day} className="text-sm cursor-pointer">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Dwinelle 155"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="30"
                />
              </div>

              <div>
                <Label htmlFor="applicationUrl">Application URL</Label>
                <Input
                  id="applicationUrl"
                  type="url"
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div>
                <Label htmlFor="applicationDue">Application Due Date</Label>
                <Input
                  id="applicationDue"
                  type="date"
                  value={formData.applicationDue}
                  onChange={(e) => setFormData({ ...formData, applicationDue: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-[#003262]">Documents</h2>

              <div>
                <Label htmlFor="syllabus">Upload Syllabus * (PDF, max 50MB)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003262] transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="syllabus"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload('syllabusFile', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="syllabus" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {formData.syllabusFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{formData.syllabusFile.name}</span>
                      </div>
                    ) : (
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="cpf">Upload CPF * (PDF, max 50MB)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003262] transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="cpf"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload('cpfFile', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="cpf" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {formData.cpfFile ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{formData.cpfFile.name}</span>
                      </div>
                    ) : (
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                    )}
                  </label>
                </div>
              </div>

              {formData.syllabusFile && formData.cpfFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Faculty sponsor verified in ASUC records</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Documents meet requirements</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#003262] hover:bg-[#003262]/90"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[#003262] hover:bg-[#003262]/90"
              >
                Submit Course
              </Button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Form auto-saves every 30 seconds
        </p>
      </div>
    </div>
  );
}
