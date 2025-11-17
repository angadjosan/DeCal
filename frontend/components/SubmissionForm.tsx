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
} from "lucide-react";
import { toast } from "sonner@2.0.3";

const categories = [
  "Arts & Creativity",
  "Business & Entrepreneurship",
  "Health & Wellness",
  "Science & Technology",
  "Social Impact",
  "Other",
];

const departments = [
  "Computer Science",
  "English",
  "Economics",
  "Public Health",
  "Sociology",
  "Business",
  "Art Practice",
  "Environmental Science",
  "Psychology",
  "Political Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Philosophy",
  "Other",
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (file: File | null) => {
    setFormData({ ...formData, cpf_file: file });
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
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleChange("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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