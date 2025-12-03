import { useState, useEffect, useMemo } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { CheckCircle2, XCircle, AlertCircle, Eye, Loader2, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface CourseFacilitator {
  id?: number;
  course_id?: number;
  name: string;
  email: string;
}

interface CourseSection {
  id?: number;
  course_id?: number;
  section_type: string;
  enrollment_status: string;
  day: string;
  time: string;
  room: string;
  capacity?: number;
  start_date?: string;
  ccn_ld?: string;
  ccn_ud?: string;
  notes?: string;
}

interface UnapprovedCourse {
  id: number;
  semester: string;
  status: string;
  title: string;
  department: string;
  category: string;
  units: number;
  contact_email: string;
  website?: string;
  description: string;
  faculty_sponsor_name: string;
  faculty_sponsor_email: string;
  enrollment_information?: string;
  application_url?: string;
  application_due_date?: string;
  time_to_complete?: number;
  cross_reference_success?: boolean;
  crossValidation?: {
    match: boolean;
    approvedCourse?: any;
  };
  cpf?: string;
  syllabus?: string;
  sections: CourseSection[];
  facilitators: CourseFacilitator[];
  created_at: string;
}

interface AdminDashboardProps {
  session: Session | null;
}

type SortField = 'title' | 'department' | 'semester' | 'contact_email' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

export function AdminDashboard({ session }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<UnapprovedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<UnapprovedCourse | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectMode, setShowRejectMode] = useState(false);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set(['Pending', 'Active', 'Rejected']));
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch submissions from the backend
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!session) {
        setLoading(false);
        toast.error('No active session. Please log in.');
        return;
      }

      try {
        const response = await fetch('/api/unapprovedCourses', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.courses || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch submissions:', response.status, errorData);
          
          if (response.status === 401) {
            toast.error('Unauthorized - Admin access required');
          } else if (response.status === 403) {
            toast.error('Access denied - Admin privileges required');
          } else {
            toast.error(`Failed to fetch submissions: ${errorData.error || response.statusText}`);
          }
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Cannot connect to backend server. Make sure it\'s running on port 3000.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [session]);

  // Get unique semesters from submissions
  const availableSemesters = useMemo(() => {
    const semesters = new Set(submissions.map(s => s.semester));
    return Array.from(semesters).sort();
  }, [submissions]);

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('created_at');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-1" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
  };

  // Apply filters and sorting
  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter(sub => {
      // Status filter
      if (!statusFilters.has(sub.status)) return false;
      
      // Semester filter
      if (selectedSemester !== 'all' && sub.semester !== selectedSemester) return false;
      
      // Search filter (search in title, department, contact_email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          sub.title.toLowerCase().includes(query) ||
          sub.department.toLowerCase().includes(query) ||
          sub.contact_email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      return true;
    });

    // Apply sorting
    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle dates
        if (sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [submissions, statusFilters, selectedSemester, searchQuery, sortField, sortDirection]);

  const stats = {
    pending: submissions.filter(s => s.status === 'Pending').length,
    approved: submissions.filter(s => s.status === 'Active').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length,
  };

  const handleReview = (submission: UnapprovedCourse) => {
    setSelectedSubmission(submission);
    setFeedback('');
    setShowRejectMode(false);
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission || !session) return;

    setActionLoading(true);
    try {
      const facilitatorEmails = selectedSubmission.facilitators.map(f => f.email);
      
      const response = await fetch('/api/approveCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: selectedSubmission.id,
          facilitatorEmails
        })
      });

      if (response.ok) {
        toast.success('Course approved successfully!');
        // Update local state
        setSubmissions(submissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, status: 'Active' }
            : s
        ));
        setIsReviewModalOpen(false);
        setSelectedSubmission(null);
        setFeedback('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to approve course');
      }
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error('Error approving course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !session) return;
    
    // If not in reject mode yet, just show the feedback form
    if (!showRejectMode) {
      setShowRejectMode(true);
      return;
    }
    
    if (!feedback.trim()) {
      toast.error('Please provide feedback before rejecting');
      return;
    }

    setActionLoading(true);
    try {
      const facilitatorEmails = selectedSubmission.facilitators.map(f => f.email);
      
      const response = await fetch('/api/rejectCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: selectedSubmission.id,
          feedback,
          facilitatorEmails
        })
      });

      if (response.ok) {
        toast.success('Course rejected with feedback sent');
        // Update local state
        setSubmissions(submissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, status: 'Rejected' }
            : s
        ));
        setIsReviewModalOpen(false);
        setSelectedSubmission(null);
        setFeedback('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to reject course');
      }
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error('Error rejecting course');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Active':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return null;
    }
  };

  const handleOpenCPF = async (courseId: number) => {
    if (!session) {
      toast.error('No active session. Please log in.');
      return;
    }

    try {
      const response = await fetch(`/api/downloadCPF/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to open CPF');
        return;
      }

      // Convert response to blob and open in new tab
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup after a delay to ensure the tab opens
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('CPF opened in new tab!');
    } catch (error) {
      console.error('Error opening CPF:', error);
      toast.error('Error opening CPF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#003262] mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-[#003262] mb-2">Admin Dashboard</h1>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#003262] mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Semester Filter */}
              <div className="mb-6">
                <Label htmlFor="semester" className="text-sm font-medium mb-2 block">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {availableSemesters.map(semester => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Status</Label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Checkbox
                      id="status-pending"
                      checked={statusFilters.has('Pending')}
                      onCheckedChange={() => toggleStatusFilter('Pending')}
                    />
                    <label htmlFor="status-pending" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      Pending ({submissions.filter(s => s.status === 'Pending').length})
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="status-approved"
                      checked={statusFilters.has('Active')}
                      onCheckedChange={() => toggleStatusFilter('Active')}
                    />
                    <label htmlFor="status-approved" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      Approved ({submissions.filter(s => s.status === 'Active').length})
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="status-rejected"
                      checked={statusFilters.has('Rejected')}
                      onCheckedChange={() => toggleStatusFilter('Rejected')}
                    />
                    <label htmlFor="status-rejected" className="ml-2 text-sm text-gray-700 cursor-pointer">
                      Rejected ({submissions.filter(s => s.status === 'Rejected').length})
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Table */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {filteredAndSortedSubmissions.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedSemester !== 'all' || statusFilters.size < 3
                      ? 'No courses match your current filters. Try adjusting your search criteria.' 
                      : 'There are no course submissions at this time.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort('title')}
                          className="flex items-center hover:text-[#003262] font-semibold"
                        >
                          Title
                          {getSortIcon('title')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('semester')}
                          className="flex items-center hover:text-[#003262] font-semibold"
                        >
                          Semester
                          {getSortIcon('semester')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center hover:text-[#003262] font-semibold"
                        >
                          Status
                          {getSortIcon('status')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center hover:text-[#003262] font-semibold"
                        >
                          Date Posted
                          {getSortIcon('created_at')}
                        </button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.title}</TableCell>
                        <TableCell>{submission.semester}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(submission.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(submission)}
                          >
                            {submission.status === 'Pending' ? 'Review' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>

        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedSubmission && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[#003262] mb-2">{selectedSubmission.title}</h2>
                  <p className="text-gray-600">
                    {selectedSubmission.semester} | {selectedSubmission.department}
                  </p>
                </div>

                {/* Admin Actions - Moved to Top */}
                {selectedSubmission.status === 'Pending' && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {!showRejectMode ? (
                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleApprove}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            'Approve Course'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={handleReject}
                          disabled={actionLoading}
                        >
                          Reject Course
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">Rejection Feedback (Required)</Label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide feedback to the course facilitators..."
                            rows={4}
                            className="w-full"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowRejectMode(false);
                              setFeedback('');
                            }}
                            disabled={actionLoading}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                            onClick={handleReject}
                            disabled={actionLoading}
                            style={{ backgroundColor: '#dc2626', color: 'white' }}
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rejecting...
                              </>
                            ) : (
                              'Submit Rejection'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedSubmission.status !== 'Pending' && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">
                      This course has been {selectedSubmission.status === 'Active' ? 'approved' : 'rejected'}.
                    </p>
                  </div>
                )}

                <hr className="border-gray-200" />

                {/* Course Details */}
                <div>
                  <h3 className="text-[#003262] mb-3">Course Details</h3>
                  <p className="text-gray-700 mb-4">{selectedSubmission.description}</p>
                  
                  {selectedSubmission.website && (
                    <p className="text-gray-700">
                      Website: <a href={selectedSubmission.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedSubmission.website}
                      </a>
                    </p>
                  )}
                </div>

                {/* Sections */}
                {selectedSubmission.sections.length > 0 && (
                  <div>
                    <h3 className="text-[#003262] mb-3">Course Sections</h3>
                    <div className="space-y-3">
                      {selectedSubmission.sections.map((section, idx) => (
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
                  {selectedSubmission.syllabus ? (
                    <p className="text-gray-700">{selectedSubmission.syllabus}</p>
                  ) : (
                    <p className="text-gray-500">No syllabus provided</p>
                  )}
                </div>

                {/* CPF */}
                <div>
                  <h3 className="text-[#003262] mb-3">CPF</h3>
                  {selectedSubmission.cpf ? (
                    <p className="text-gray-700">
                      <button
                        onClick={() => handleOpenCPF(selectedSubmission.id)}
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View CPF Document
                        <Eye className="h-4 w-4" />
                      </button>
                    </p>
                  ) : (
                    <p className="text-gray-500">No CPF uploaded</p>
                  )}
                </div>

                {/* Facilitators */}
                <div>
                  <h3 className="text-[#003262] mb-3">Facilitators</h3>
                  <p className="text-gray-700">
                    Faculty Sponsor: {selectedSubmission.faculty_sponsor_name} ({selectedSubmission.faculty_sponsor_email})
                  </p>
                  <p className="text-gray-700 mt-2">
                    Contact Email: {selectedSubmission.contact_email}
                  </p>
                  <br></br>
                  {selectedSubmission.facilitators.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {selectedSubmission.facilitators.map((facilitator, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-3 text-sm">
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
