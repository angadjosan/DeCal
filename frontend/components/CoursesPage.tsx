import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { CourseDetailModal } from './CourseDetailModal';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Course } from '../types';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState([10]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Fetch semesters from backend API
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await fetch('/api/semesters');
        const data = await response.json();
        
        if (data.success && data.semesters) {
          const semesterList = data.semesters.map((s: any) => s.semester);
          setSemesters(semesterList);
          // Set the first semester as default if not already set
          if (semesterList.length > 0 && !selectedSemester) {
            setSelectedSemester(semesterList[0]);
          }
        } else {
          toast.error('Failed to load semesters');
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        toast.error('Failed to load semesters');
      }
    };

    fetchSemesters();
  }, []);

  // Fetch courses from backend API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/approvedCourses');
        const data = await response.json();
        
        if (data.success && data.courses) {
          setCourses(data.courses);
        } else {
          toast.error('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      // Search query - search across all fields
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesDescription = course.description.toLowerCase().includes(query);
        const matchesDepartment = course.department.toLowerCase().includes(query);
        const matchesCategory = course.category.toLowerCase().includes(query);
        const matchesSemester = course.semester.toLowerCase().includes(query);
        const matchesContactEmail = course.contact_email?.toLowerCase().includes(query);
        const matchesWebsite = course.website?.toLowerCase().includes(query);
        const matchesFacilitySponsor = course.faculty_sponsor_name?.toLowerCase().includes(query);
        const matchesEnrollmentInfo = course.enrollment_information?.toLowerCase().includes(query);
        const matchesApplicationUrl = course.application_url?.toLowerCase().includes(query);
        const matchesFacilitator = course.facilitators.some(f => 
          f.name.toLowerCase().includes(query) || f.email.toLowerCase().includes(query)
        );
        const matchesSection = course.sections.some(s => 
          s.enrollment_status.toLowerCase().includes(query) ||
          s.day.toLowerCase().includes(query) ||
          s.time.toLowerCase().includes(query) ||
          s.room.toLowerCase().includes(query) ||
          s.notes?.toLowerCase().includes(query)
        );
        
        if (!matchesTitle && !matchesDescription && !matchesDepartment && 
            !matchesCategory && !matchesSemester && !matchesContactEmail && 
            !matchesWebsite && !matchesFacilitySponsor && !matchesEnrollmentInfo && 
            !matchesApplicationUrl && !matchesFacilitator && !matchesSection) {
          return false;
        }
      }

      // Semester
      if (course.semester !== selectedSemester) {
        return false;
      }

      // Categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }

      // Departments
      if (selectedDepartments.length > 0 && !selectedDepartments.includes(course.department)) {
        return false;
      }

      // Units
      if (selectedUnits.length > 0 && !selectedUnits.includes(course.units)) {
        return false;
      }

      // Status - check enrollment status from sections
      if (selectedStatuses.length > 0) {
        const hasMatchingStatus = course.sections.some(section => 
          selectedStatuses.some(status => 
            section.enrollment_status.toLowerCase().includes(status.toLowerCase())
          )
        );
        if (!hasMatchingStatus && course.sections.length > 0) {
          return false;
        }
      }

      return true;
    });

    // Sort alphabetically by title
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [courses, searchQuery, selectedSemester, selectedCategories, selectedDepartments, selectedUnits, selectedStatuses]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };
  const toggleUnit = (unit: number) => {
    setSelectedUnits(prev =>
      prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDepartments([]);
    setSelectedUnits([]);
    setSelectedStatuses([]);
    setTimeCommitment([10]);
  };

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[#003262] mb-2">Courses Dashboard</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-[280px] flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {/* Semester Selector */}
              <div className="mb-6">
                <h4 className="mb-3 text-gray-900">Semester</h4>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <h4 className="mb-3 text-gray-900">Search</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <hr className="border-gray-200 mb-6" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#003262]">Filters</h3>
                {(selectedCategories.length > 0 || selectedDepartments.length > 0 || 
                  selectedUnits.length > 0 || selectedStatuses.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="mb-3 text-gray-900">Category</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label htmlFor={category} className="text-sm text-gray-700 cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Units */}
                <div>
                  <h4 className="mb-3 text-gray-900">Units</h4>
                  <div className="space-y-2">
                    {[1, 2].map(unit => (
                      <div key={unit} className="flex items-center gap-2">
                        <Checkbox
                          id={`unit-${unit}`}
                          checked={selectedUnits.includes(unit)}
                          onCheckedChange={() => toggleUnit(unit)}
                        />
                        <label htmlFor={`unit-${unit}`} className="text-sm text-gray-700 cursor-pointer">
                          {unit} {unit === 1 ? 'unit' : 'units'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Enrollment Status */}
                <div>
                  <h4 className="mb-3 text-gray-900">Enrollment Status</h4>
                  <div className="space-y-2">
                    {['Open', 'Waitlist'].map(status => (
                      <div key={status} className="flex items-center gap-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={selectedStatuses.includes(status)}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <label htmlFor={`status-${status}`} className="text-sm text-gray-700 cursor-pointer">
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">No courses match your filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
