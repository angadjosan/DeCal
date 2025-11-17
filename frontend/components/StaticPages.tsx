interface StaticPageProps {
  page: 'about' | 'faq' | 'facilitate';
}

export function StaticPages({ page }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Main Content */}
        <main className="bg-white border border-gray-200 rounded-lg p-8 md:p-12">
            {page === 'about' && (
              <div className="space-y-8">
                <section id="about">
                  <h1 className="text-[#003262] mb-4">About DeCals</h1>
                  <p className="text-gray-700 mb-4">
                    Berkeley's Democratic Education at Cal (DeCal) program allows students to create and facilitate their own courses. Since 1981, DeCals have been an integral part of the Berkeley experience, offering unique perspectives and subjects not found in traditional curricula.
                  </p>
                  <p className="text-gray-700">
                    From AI and machine learning to creative writing and mindfulness, DeCals reflect the diverse interests and expertise of Berkeley's student community. These student-led courses provide hands-on learning experiences and foster a collaborative educational environment.
                  </p>
                </section>

                <section id="mission">
                  <h2 className="text-[#003262] mb-4">Our Mission</h2>
                  <p className="text-gray-700 mb-4">
                    The DeCal program empowers students to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>Share their expertise and passions with peers</li>
                    <li>Develop teaching and leadership skills</li>
                    <li>Create inclusive learning communities</li>
                    <li>Explore subjects beyond traditional academic offerings</li>
                    <li>Foster democratic education and student autonomy</li>
                  </ul>
                </section>

                <section id="team">
                  <h2 className="text-[#003262] mb-6">The Team</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'Sarah Johnson', role: 'Program Director' },
                      { name: 'Michael Chen', role: 'Academic Coordinator' },
                      { name: 'Emily Martinez', role: 'Student Liaison' },
                      { name: 'David Kim', role: 'Technology Lead' },
                      { name: 'Lisa Anderson', role: 'Faculty Advisor' },
                      { name: 'James Taylor', role: 'Community Manager' },
                    ].map((member, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 text-center">
                        <div className="w-20 h-20 bg-[#FDB515] rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-[#003262] text-2xl">{member.name[0]}</span>
                        </div>
                        <h3 className="text-gray-900 mb-1">{member.name}</h3>
                        <p className="text-gray-600 text-sm">{member.role}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {page === 'faq' && (
              <div className="space-y-8">
                <h1 className="text-[#003262] mb-6">Frequently Asked Questions</h1>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[#003262] mb-2">What is a DeCal?</h3>
                    <p className="text-gray-700">
                      DeCal stands for Democratic Education at Cal. These are student-facilitated courses that allow students to learn about topics they're passionate about, taught by their peers.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#003262] mb-2">How do I enroll in a DeCal?</h3>
                    <p className="text-gray-700">
                      Browse available courses on our Courses page, select the DeCal you're interested in, and follow the enrollment or application instructions. Some DeCals have open enrollment, while others require an application.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#003262] mb-2">Can I get credit for taking a DeCal?</h3>
                    <p className="text-gray-700">
                      Yes! Most DeCals offer 1-2 units of credit. Credits can be taken for a letter grade or Pass/No Pass, depending on the course.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#003262] mb-2">How do I propose a DeCal course?</h3>
                    <p className="text-gray-700">
                      Visit our "Submit a DeCal" page to start your proposal. You'll need a course description, syllabus, and a faculty sponsor. Our team will review your proposal and provide feedback.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#003262] mb-2">What's the time commitment for facilitating a DeCal?</h3>
                    <p className="text-gray-700">
                      Facilitators typically spend 3-5 hours per week on course preparation, teaching, and student communication. The exact time varies based on course content and structure.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[#003262] mb-2">Do I need teaching experience to facilitate?</h3>
                    <p className="text-gray-700">
                      No! We welcome first-time facilitators. We provide training, resources, and support throughout the semester. Passion for your subject and willingness to learn are the most important qualities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {page === 'facilitate' && (
              <div className="space-y-8">
                <h1 className="text-[#003262] mb-6">How to Facilitate a DeCal</h1>

                <section>
                  <h2 className="text-[#003262] mb-4">Step 1: Develop Your Idea</h2>
                  <p className="text-gray-700 mb-4">
                    Think about what you're passionate about and what unique perspective you can offer. Consider:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>What expertise or experience do you have?</li>
                    <li>Is there student interest in this topic?</li>
                    <li>How will this complement existing courses?</li>
                    <li>What learning outcomes do you envision?</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Step 2: Find a Faculty Sponsor</h2>
                  <p className="text-gray-700 mb-4">
                    Every DeCal needs a faculty sponsor. This should be a professor or lecturer who:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Has expertise related to your course topic</li>
                    <li>Can provide guidance and oversight</li>
                    <li>Will approve your syllabus and course materials</li>
                    <li>Can assist with grading or academic issues</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Step 3: Create Your Course Proposal</h2>
                  <p className="text-gray-700 mb-4">
                    Your proposal should include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Course Description:</strong> Clear overview of topics and learning objectives</li>
                    <li><strong>Syllabus:</strong> Weekly schedule, assignments, and grading policy</li>
                    <li><strong>Course Plan Form (CPF):</strong> Official document signed by your faculty sponsor</li>
                    <li><strong>Meeting Schedule:</strong> When and where your course will meet</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Step 4: Submit Your Proposal</h2>
                  <p className="text-gray-700 mb-4">
                    Use our online submission form to upload all required materials. Deadlines are typically:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Fall semester: April 1st</li>
                    <li>Spring semester: November 1st</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Step 5: Course Review</h2>
                  <p className="text-gray-700 mb-4">
                    Our review committee will evaluate your proposal based on:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Academic rigor and learning objectives</li>
                    <li>Feasibility and organization</li>
                    <li>Uniqueness and student interest</li>
                    <li>Facilitator qualifications and preparation</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Resources & Support</h2>
                  <p className="text-gray-700 mb-4">
                    We provide comprehensive support for facilitators:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Facilitator training workshops</li>
                    <li>Course design consultations</li>
                    <li>Teaching assistant support</li>
                    <li>Classroom reservations and technology</li>
                    <li>Marketing and enrollment assistance</li>
                  </ul>
                </section>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
