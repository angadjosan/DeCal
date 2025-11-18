import { useState } from "react";
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

// Generate current and next semesters
const generateSemesters = () => {
  const semesters = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Determine current semester
  let startYear = currentYear;
  let startSemester = currentMonth >= 8 ? "Fall" : "Spring";

  // Generate next 4 semesters
  for (let i = 0; i < 4; i++) {
    semesters.push(`${startSemester} ${startYear}`);
    if (startSemester === "Fall") {
      startSemester = "Spring";
      startYear++;
    } else {
      startSemester = "Fall";
    }
  }

  return semesters;
};

export function SubmissionForm() {
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

    setIsSubmitting(true);

    // Prepare data for submission with proper type conversions
    const submissionData = {
      ...formData,
      // Convert units from string to integer
      units: parseInt(formData.units, 10),
      // Convert application_due_date to timestamp (ISO 8601 format for Supabase)
      application_due_date: formData.application_due_date 
        ? new Date(formData.application_due_date).toISOString() 
        : null,
    };

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
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
    }, 1500);
  };

  const semesters = generateSemesters();

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="semester">Semester *</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) =>
                      handleChange("semester", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                <Textarea
                  id="syllabus_text"
                  value={formData.syllabus_text}
                  onChange={(e) =>
                    handleChange(
                      "syllabus_text",
                      e.target.value,
                    )
                  }
                  placeholder="Paste your syllabus here or provide a detailed course outline..."
                  rows={8}
                  className="resize-none"
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
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    handleChange("website", e.target.value)
                  }
                  placeholder="https://"
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
                  type="url"
                  value={formData.application_url}
                  onChange={(e) =>
                    handleChange(
                      "application_url",
                      e.target.value,
                    )
                  }
                  placeholder="https://"
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