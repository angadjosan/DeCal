import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import {
  Calendar,
  Upload,
  FileText,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { RichTextEditor } from "./ui/rich-text-editor";

const categories = [
  "Publication",
  "Health",
  "Environment",
  "Cultural",
  "Political/Social",
  "Media",
  "Professional/Business",
  "Food",
];

interface SubmissionFormProps {
  session: Session | null;
}

export function SubmissionForm({ session }: SubmissionFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    semester: "",
    title: "",
    department: "",
    category: "",
    units: "",
    contact_email: "",
    website: "",
    description: "",
    faculty_sponsor_name: "",
    faculty_sponsor_email: "",
    enrollment_information: "",
    application_url: "",
    application_due_date: "",
    syllabus_text: "",
    cpf_file: null as File | null,
  });

  // Fetch current semester from API
  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const response = await fetch('/api/semesters');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.semesters && result.semesters.length > 0) {
            setFormData(prev => ({ ...prev, semester: result.semesters[0].semester }));
          }
        }
      } catch (error) {
        console.error('Error fetching semester:', error);
      }
    };
    
    fetchSemester();
  }, []);

  const [sections, setSections] = useState<Array<{
    id: number;
    enrollmentStatus: string;
    day: string;
    time: string;
    room: string;
    notes: string;
  }>>([]);

  const [facilitators, setFacilitators] = useState<Array<{
    id: number;
    name: string;
    email: string;
  }>>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (file: File | null) => {
    setFormData({ ...formData, cpf_file: file });
  };

  const addSection = () => {
    setSections([...sections, {
      id: Date.now(),
      enrollmentStatus: "Open",
      day: "",
      time: "",
      room: "",
      notes: ""
    }]);
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const updateSection = (id: number, field: string, value: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const addFacilitator = () => {
    setFacilitators([...facilitators, {
      id: Date.now(),
      name: "",
      email: ""
    }]);
  };

  const removeFacilitator = (id: number) => {
    setFacilitators(facilitators.filter(facilitator => facilitator.id !== id));
  };

  const updateFacilitator = (id: number, field: string, value: string) => {
    setFacilitators(facilitators.map(facilitator => 
      facilitator.id === id ? { ...facilitator, [field]: value } : facilitator
    ));
  };

  // Normalize URL to include https:// if not present
  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    
    // If it already has a protocol, return as-is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    
    // Add https:// prefix
    return `https://${trimmed}`;
  };

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URLs are allowed (optional fields)
    
    const normalized = normalizeUrl(url);
    
    try {
      const urlObj = new URL(normalized);
      // Check if it has a valid domain pattern
      return /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*)+$/.test(urlObj.hostname);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "semester",
      "title",
      "department",
      "category",
      "units",
      "contact_email",
      "description",
      "faculty_sponsor_name",
      "faculty_sponsor_email",
      "syllabus_text",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData],
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate CPF file upload
    if (!formData.cpf_file) {
      toast.error(
        "Please upload a Course Proposal Form (CPF) PDF",
      );
      return;
    }

    // Validate file type
    if (formData.cpf_file.type !== 'application/pdf') {
      toast.error("CPF file must be a PDF");
      return;
    }

    // Validate file size (max 50MB)
    if (formData.cpf_file.size > 50 * 1024 * 1024) {
      toast.error("CPF file must be less than 50MB");
      return;
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast.error("Please enter a valid contact email");
      return;
    }
    if (!emailRegex.test(formData.faculty_sponsor_email)) {
      toast.error("Please enter a valid faculty sponsor email");
      return;
    }

    // Validate sections if any are added
    if (sections.length > 0) {
      const incompleteSections = sections.filter(s => !s.day || !s.time || !s.room);
      if (incompleteSections.length > 0) {
        toast.error("Please complete all section fields");
        return;
      }
    }

    // Validate facilitators if any are added
    if (facilitators.length > 0) {
      const incompleteFacilitators = facilitators.filter(f => !f.name || !f.email);
      if (incompleteFacilitators.length > 0) {
        toast.error("Please complete all facilitator fields");
        return;
      }

      const invalidEmails = facilitators.filter(f => !emailRegex.test(f.email));
      if (invalidEmails.length > 0) {
        toast.error("Please enter valid facilitator emails");
        return;
      }
    }

    // Validate URLs if provided
    if (formData.website && !isValidUrl(formData.website)) {
      toast.error("Please enter a valid website URL (e.g., website.com or https://website.com)");
      return;
    }

    if (formData.application_url && !isValidUrl(formData.application_url)) {
      toast.error("Please enter a valid application URL (e.g., website.com or https://website.com)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to send file and data together
      const formDataToSend = new FormData();
      
      // Add the CPF file
      formDataToSend.append('cpf_file', formData.cpf_file);
      
      // Add all other form data as JSON string
      const submissionData = {
        semester: formData.semester,
        title: formData.title,
        department: formData.department,
        category: formData.category,
        units: parseInt(formData.units, 10),
        contact_email: formData.contact_email,
        website: formData.website ? normalizeUrl(formData.website) : null,
        description: formData.description,
        faculty_sponsor_name: formData.faculty_sponsor_name,
        faculty_sponsor_email: formData.faculty_sponsor_email,
        enrollment_information: formData.enrollment_information || null,
        application_url: formData.application_url ? normalizeUrl(formData.application_url) : null,
        application_due_date: formData.application_due_date 
          ? new Date(formData.application_due_date).toISOString() 
          : null,
        syllabus: formData.syllabus_text,
        sections: sections.map(s => ({
          enrollment_status: s.enrollmentStatus,
          day: s.day,
          time: s.time,
          room: s.room,
          notes: s.notes || null
        })),
        facilitatorEmails: facilitators.map(f => f.email),
        facilitators: facilitators.map(f => ({
          name: f.name,
          email: f.email
        }))
      };
      
      formDataToSend.append('data', JSON.stringify(submissionData));

      // Get the JWT token from session
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('You must be logged in to submit a course');
      }

      // Make API call with FormData and Authorization header
      const response = await fetch('/api/submitCourse', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit course');
      }

      toast.success(
        "DeCal submission received! You will be notified once it has been reviewed.",
      );

      // Reset form
      setFormData({
        semester: "",
        title: "",
        department: "",
        category: "",
        units: "",
        contact_email: "",
        website: "",
        description: "",
        faculty_sponsor_name: "",
        faculty_sponsor_email: "",
        enrollment_information: "",
        application_url: "",
        application_due_date: "",
        syllabus_text: "",
        cpf_file: null,
      });
      setSections([]);
      setFacilitators([]);
      
      // Navigate to courses page
      navigate('/courses');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to submit course. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[#003262] mb-2">
            Submit a DeCal
          </h1>
          <p className="text-gray-600">
            Fill out the form below to propose your DeCal
            course. Visit the Resources section to learn about
            the submission process. All fields marked with * are
            required.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[#003262] mb-4">
                  Basic Information
                </h3>
              </div>

              <div className="mb-6">
                <Label>Semester</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {formData.semester || "Loading..."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="units">Units *</Label>
                  <Select
                    value={formData.units}
                    onValueChange={(value) =>
                      handleChange("units", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 unit</SelectItem>
                      <SelectItem value="2">2 units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    handleChange("title", e.target.value)
                  }
                  placeholder="e.g., Introduction to AI and Machine Learning"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="department">
                    Department *
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      handleChange("department", e.target.value)
                    }
                    placeholder="e.g., Computer Science, English, Economics"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">
                  Course Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  placeholder="A few paragraphs about your class - are there any papers or exams? What is the attendance policy? etc."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[#003262] mb-4">
                  Contact Information
                </h3>
              </div>

              <div>
                <Label htmlFor="contact_email">
                  Your Email *
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    handleChange(
                      "contact_email",
                      e.target.value,
                    )
                  }
                  placeholder="your.email@berkeley.edu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="faculty_sponsor_name">
                    Faculty Sponsor Name *
                  </Label>
                  <Input
                    id="faculty_sponsor_name"
                    value={formData.faculty_sponsor_name}
                    onChange={(e) =>
                      handleChange(
                        "faculty_sponsor_name",
                        e.target.value,
                      )
                    }
                    placeholder="Prof. Jane Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="faculty_sponsor_email">
                    Faculty Sponsor Email *
                  </Label>
                  <Input
                    id="faculty_sponsor_email"
                    type="email"
                    value={formData.faculty_sponsor_email}
                    onChange={(e) =>
                      handleChange(
                        "faculty_sponsor_email",
                        e.target.value,
                      )
                    }
                    placeholder="sponsor@berkeley.edu"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Course Materials */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[#003262] mb-4">
                  Course Materials
                </h3>
              </div>

              <div>
                <Label htmlFor="syllabus_text">
                  Syllabus *
                </Label>
                <RichTextEditor
                  content={formData.syllabus_text}
                  onChange={(content) => handleChange("syllabus_text", content)}
                  placeholder="Paste your syllabus here or provide a detailed course outline..."
                />
              </div>

              <div>
                <Label htmlFor="cpf_file">
                  Course Proposal Form (CPF) *
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#003262] transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="cpf_file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                  <label
                    htmlFor="cpf_file"
                    className="cursor-pointer"
                  >
                    {formData.cpf_file ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>{formData.cpf_file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, max 50MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />
            
            {/* Sections */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#003262]">
                  Sections
                </h3>
                <Button
                  type="button"
                  onClick={addSection}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Section
                </Button>
              </div>

              {sections.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No sections added yet. Click "Add New Section" to get started.</p>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={section.id} className="p-4 relative">
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      
                      <h4 className="font-semibold text-sm mb-3 text-[#003262]">Section {index + 1}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`section-status-${section.id}`}>Enrollment Status *</Label>
                          <Select
                            value={section.enrollmentStatus}
                            onValueChange={(value) => updateSection(section.id, 'enrollmentStatus', value)}
                          >
                            <SelectTrigger id={`section-status-${section.id}`}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="Full">Full</SelectItem>
                              <SelectItem value="Waitlist">Waitlist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`section-day-${section.id}`}>Day *</Label>
                          <Input
                            id={`section-day-${section.id}`}
                            value={section.day}
                            onChange={(e) => updateSection(section.id, 'day', e.target.value)}
                            placeholder="e.g., Monday, Wednesday"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`section-time-${section.id}`}>Time *</Label>
                          <Input
                            id={`section-time-${section.id}`}
                            value={section.time}
                            onChange={(e) => updateSection(section.id, 'time', e.target.value)}
                            placeholder="e.g., 6:00 PM - 8:00 PM"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`section-room-${section.id}`}>Room *</Label>
                          <Input
                            id={`section-room-${section.id}`}
                            value={section.room}
                            onChange={(e) => updateSection(section.id, 'room', e.target.value)}
                            placeholder="e.g., Wheeler 150"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`section-notes-${section.id}`}>Notes for Students</Label>
                          <Textarea
                            id={`section-notes-${section.id}`}
                            value={section.notes}
                            onChange={(e) => updateSection(section.id, 'notes', e.target.value)}
                            placeholder="Any additional information (e.g., class numbers, prerequisites)"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[#003262] font-semibold">
                    Facilitators
                  </h4>
                  <Button
                    type="button"
                    onClick={addFacilitator}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Facilitator
                  </Button>
                </div>

                {facilitators.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No facilitators added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {facilitators.map((facilitator, index) => (
                      <Card key={facilitator.id} className="p-4 relative">
                        <button
                          type="button"
                          onClick={() => removeFacilitator(facilitator.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        
                        <h5 className="font-semibold text-sm mb-3 text-[#003262]">Facilitator {index + 1}</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`facilitator-name-${facilitator.id}`}>Name *</Label>
                            <Input
                              id={`facilitator-name-${facilitator.id}`}
                              value={facilitator.name}
                              onChange={(e) => updateFacilitator(facilitator.id, 'name', e.target.value)}
                              placeholder="Facilitator name"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`facilitator-email-${facilitator.id}`}>Email *</Label>
                            <Input
                              id={`facilitator-email-${facilitator.id}`}
                              type="email"
                              value={facilitator.email}
                              onChange={(e) => updateFacilitator(facilitator.id, 'email', e.target.value)}
                              placeholder="facilitator@berkeley.edu"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />
            
            {/* Additional Details (Optional) */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[#003262] mb-4">
                  Additional Details (Optional)
                </h3>
              </div>

              <div>
                <Label htmlFor="website">Course Website</Label>
                <Input
                  id="website"
                  type="text"
                  value={formData.website}
                  onChange={(e) =>
                    handleChange("website", e.target.value)
                  }
                  placeholder="example.com or https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="enrollment_information">
                  Enrollment Information
                </Label>
                <Textarea
                  id="enrollment_information"
                  value={formData.enrollment_information}
                  onChange={(e) =>
                    handleChange(
                      "enrollment_information",
                      e.target.value,
                    )
                  }
                  placeholder="What's your policy? First come, first served? Interviews? Applications? Lottery?"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <Label htmlFor="application_url">
                  Application URL
                </Label>
                <Input
                  id="application_url"
                  type="text"
                  value={formData.application_url}
                  onChange={(e) =>
                    handleChange(
                      "application_url",
                      e.target.value,
                    )
                  }
                  placeholder="example.com or https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="application_due_date">
                  Application Due Date
                </Label>
                <Input
                  id="application_due_date"
                  type="date"
                  value={formData.application_due_date}
                  onChange={(e) =>
                    handleChange(
                      "application_due_date",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#003262] hover:bg-[#003262]/90 px-8"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit DeCal Proposal"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Check out our{" "}
          <a
            href="#"
            className="text-[#003262] hover:underline"
          >
            submission guidelines
          </a>
        </p>
      </div>
    </div>
  );
}