import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, XCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { mockSubmissions } from '../lib/mock-data';
import { CourseSubmission } from '../types';

export function AdminDashboard() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<CourseSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const stats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const handleReview = (submission: CourseSubmission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || '');
    setIsReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedSubmission) {
      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'approved' as const, feedback }
          : s
      ));
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      setFeedback('');
    }
  };

  const handleReject = () => {
    if (selectedSubmission && feedback) {
      setSubmissions(submissions.map(s =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'rejected' as const, feedback }
          : s
      ));
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      setFeedback('');
    } else {
      alert('Please provide feedback before rejecting');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">🟡 Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">✅ Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">❌ Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <h1 className="text-[#003262] mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pending Reviews</p>
                <p className="text-[#FDB515]">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-[#FDB515]" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Approved</p>
                <p className="text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Rejected</p>
                <p className="text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Label>Filter:</Label>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Facilitator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.title}</TableCell>
                  <TableCell>{submission.department}</TableCell>
                  <TableCell>{submission.semester}</TableCell>
                  <TableCell>{submission.submittedBy}</TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(submission)}
                    >
                      {submission.status === 'pending' ? 'Review' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedSubmission && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[#003262] mb-2">{selectedSubmission.title}</h2>
                  <p className="text-gray-600">
                    {selectedSubmission.semester} | {selectedSubmission.department} | {selectedSubmission.units} units
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Auto-Validation Results */}
                <div>
                  <h3 className="text-[#003262] mb-3">📊 Auto-Validation Results</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Faculty sponsor verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>CPF format valid</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-5 w-5" />
                      <span>Syllabus missing grading criteria (AI flagged)</span>
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div>
                  <h3 className="text-[#003262] mb-3">Course Details</h3>
                  <p className="text-gray-700 mb-4">{selectedSubmission.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="text-gray-900">{selectedSubmission.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <p className="text-gray-900">{selectedSubmission.capacity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="text-gray-900">{selectedSubmission.location || 'TBD'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Meeting Times:</span>
                      <p className="text-gray-900">
                        {selectedSubmission.meetingTimes[0]?.days.join(', ')} {selectedSubmission.meetingTimes[0]?.startTime}-{selectedSubmission.meetingTimes[0]?.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-[#003262] mb-3">📄 Documents</h3>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Syllabus
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View CPF
                    </Button>
                  </div>
                </div>

                {/* Facilitators */}
                <div>
                  <h3 className="text-[#003262] mb-3">📧 Facilitators</h3>
                  <ul className="space-y-1">
                    {selectedSubmission.facilitators.map((facilitator, index) => (
                      <li key={index} className="text-gray-700">• {facilitator} (verified)</li>
                    ))}
                  </ul>
                  <p className="text-gray-700 mt-2">
                    Faculty Sponsor: {selectedSubmission.facultySponsor.name} ({selectedSubmission.facultySponsor.email})
                  </p>
                </div>

                <hr className="border-gray-200" />

                {/* Admin Actions */}
                {selectedSubmission.status === 'pending' && (
                  <div>
                    <h3 className="text-[#003262] mb-3">Admin Actions</h3>
                    
                    <div className="mb-4">
                      <Label htmlFor="feedback">Feedback {selectedSubmission.status === 'pending' ? '(required if rejecting)' : ''}</Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide feedback to the course facilitators..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={handleReject}
                      >
                        Reject with Feedback
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                      >
                        Approve Course
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSubmission.status !== 'pending' && selectedSubmission.feedback && (
                  <div>
                    <h3 className="text-[#003262] mb-3">Feedback</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedSubmission.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
