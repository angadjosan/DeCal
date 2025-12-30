interface StaticPageProps {
  page: 'faq' | 'facilitate';
}

export function StaticPages({ page }: StaticPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Main Content */}
        <main className="bg-white border border-gray-200 rounded-lg p-8 md:p-12">
            {page === 'faq' && (
              <div className="space-y-8">
                <h1 className="text-[#003262] mb-6">FAQ</h1>

                <section>
                  <h2 className="text-[#003262] mb-4">Student FAQs</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#003262] mb-2">When are classes for the next semester put up?</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>For Fall semester, most classes are put up in mid-August.</li>
                        <li>For Spring semester, most classes are put up in mid-January.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-[#003262] mb-2">When can I start applying to DeCals? When are applications due?</h3>
                      <p className="text-gray-700">
                        Application deadlines are dependent on the DeCal course. Make sure you read the "How to Enroll" section of your desired DeCal.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[#003262] mb-2">Can I take DeCals for a grade?</h3>
                      <p className="text-gray-700">
                        No, all courses are P/NP.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[#003262] mb-2">How can I start a DeCal?</h3>
                      <p className="text-gray-700">
                        Check out our "How to Start a DeCal" page!
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">Facilitator FAQs</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#003262] mb-2">How to Submit a Class to the DeCal Website</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Login into the DeCal Website.</li>
                        <li>Click on 'Dashboard' on the upper right hand corner of the website.</li>
                        <li>Click on the yellow 'Submit a Course for Approval' button.</li>
                        <li>Follow the steps until completion of form.</li>
                        <li>After submission, you should receive a confirmation email.</li>
                        <li>Check your email for any status changes.</li>
                      </ol>
                      <p className="text-gray-700 mt-4">
                        You may go back and make edits to all course information, expect the Course Name, so make sure that it is correct in the beginning.
                      </p>
                      <p className="text-gray-700 mt-2">
                        Please check your email if your course is rejected and make edits according to comments. Please feel free to email us at decalprogram@gmail.com if you have any further questions.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[#003262] mb-2">Common Mistakes</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Select the correct semester: Spring 2021</li>
                        <li>Upload both the CPF and Syllabus</li>
                        <li>CPF must be complete: meaning ALL the signatures are completed, the units form is uploaded, etc.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-[#003262] mb-2">I would like to know more about…</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>...how to facilitate.</li>
                        <li>...workshops.</li>
                        <li>...DeCal-related deadlines.</li>
                        <li>...resources.</li>
                        <li>...the Student Learning Center.</li>
                      </ul>
                      <p className="text-gray-700 mt-4">
                        Anything else? Just ask on the DeCal 101 Piazza or drop by at our office hours @ 312C Eshleman Hall.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">About This Website</h2>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <a href="https://www.ocf.berkeley.edu">
                      <img 
                        src="http://www.ocf.berkeley.edu/hosting-logos/ocf-hosted-penguin.svg"
                        alt="Hosted by the OCF" 
                        style={{ border: 0, width: '80px', height: 'auto' }} 
                      />
                    </a>
                    <p className="text-gray-700">
                      We are a student group acting independently of the University of California. We take full responsibility for our organization and this web site.
                    </p>
                  </div>
                </section>
              </div>
            )}

            {page === 'facilitate' && (
              <div className="space-y-8">
                <h1 className="text-[#003262] mb-6">How to Facilitate</h1>

                <section>
                  <p className="text-gray-700 mb-4">
                    Facilitators are the pillars of DeCal Program. Their duties include but are not limited to recruiting students, setting up and running classes on a semester-basis, and report to school faculties. Being a facilitator requires a lot of time!
                  </p>
                  <p className="text-gray-700 mb-4">
                    But don't worry, you can find lots of resources to help and guide you. Besides this website and the DeCal Board, the Student Learning Center (SLC) has a supporting program for DeCal facilitators. The Undergraduate Course Facilitator Training & Resources (UCFTR) are trained, professional staff hired by the UC to help you. So use them! They can help you at any stage of the process: finding a sponsor, writing a syllabus, forming a lesson plan, dealing with student complaints, etc. The DeCal Board consults UCFTR when we are not sure about something.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Contact information:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li>Website: <a href="http://slc.berkeley.edu/ucftr/" className="text-[#003262] hover:underline" target="_blank" rel="noopener noreferrer">http://slc.berkeley.edu/ucftr/</a></li>
                    <li>E-mail: slc-ucftr@berkeley.edu</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-[#003262] mb-4">How to Start a DeCal</h2>
                  <p className="text-gray-700 mb-4">Here are the 6 main steps to get started:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
                    <li>Develop a Syllabus</li>
                    <li>Find a Faculty Sponsor</li>
                    <li>Complete the Course Proposal Form (CPF)</li>
                    <li>Attend a Workshop Offered Through the Student Learning Center (SLC)</li>
                    <li>Turn in CPF to your Department and Academic Senate</li>
                    <li>Send us a Facebook Post to Advertise Your Course</li>
                  </ol>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Develop a Syllabus</h3>
                  <p className="text-gray-700 mb-4">
                    The course syllabus is your primary tool for making sure that your class has a "map" to follow. A well-written syllabus demonstrates the facilitator's commitment to the course, its students, and the faculty sponsor. As the semester progresses, it is acceptable to deviate from the map, but it is good to have a plan! Your students also need to know what is going on and what will be expected of them. It is very important to have a clear understanding with your students.
                  </p>
                  <p className="text-gray-700 mb-4">
                    In the syllabus, you must list: all assignments and respective due dates, grading policy, attendance, description of your course, and your contact information. You must make it very clear what your students need to do in order to get a "P" in your course.
                  </p>
                  <p className="text-gray-700 mb-4">
                    It is also possible to create a syllabus and a class that are both structured and flexible. For example, you can indicate that you and your students will decide ground rules for the class. Similarly, you may wish to leave time in your class schedule for student presentations, or for students to lead the class for a week.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Here is a syllabus checklist that you can refer to; if you have any questions, please contact UCFTR.
                  </p>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Find a Faculty Sponsor</h3>
                  <p className="text-gray-700 mb-4">
                    You must find a UC Berkeley faculty member within your DeCal's prospective department who is willing to sponsor your course. Your sponsor is in charge of submitting your course's final grades and creating a bCourses site, as well as being a reference point throughout the semester. Once you find a professor you are comfortable working with and who agreed to be a sponsor, they must look over your syllabus, sign your Course Proposal Form (CPF) and write a Letter of Support.
                  </p>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Complete CPF</h3>
                  <p className="text-gray-700 mb-4">The CPF can be confusing if you're seeing it for the first time. Here are some quick descriptions to each item on the form:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Date Submitted:</strong> The date you completed and turned in your form</li>
                    <li><strong>Term to be Offered:</strong> The semester which your course will be offered</li>
                    <li><strong>Campus Department:</strong> The department which your course belongs to</li>
                    <li><strong>Course Title:</strong> Name of your course</li>
                    <li><strong>Course Number:</strong> Whether you are offering your course as an upper or lower division course (a 98 or a 198 course, or both)</li>
                    <li><strong>Number of Units:</strong> Units for the course, usually 1-2 units for each DeCal Course (can offer both 1 and 2 units and let students decide the number of units they want)</li>
                    <li><strong>Student Facilitator Name(s):</strong> Your (and your co-facilitator's) name</li>
                    <li><strong>Student Facilitator Email Address(es):</strong> You (and your co-facilitator's) email address</li>
                    <li><strong>Instructor of Record Name:</strong> Your faculty sponsor's name. A faculty sponsor has to be a lecturer or a faculty member who is authorized to create and manage a class within the university (GSIs don't count, sorry) and is responsible for all the requirements on the faculty checklist. Your faculty sponsor can be a valuable source to you- they have already created and taught courses!</li>
                    <li><strong>Check-Box Questions:</strong> Instruction is given. "Appropriate Department Staff Person or Website" refers to your course advisor. You can find them here. Sometimes the department contact is your course advisor. Your course advisor deals with the logistical details for your class. When you talk to the advisor, be flexible with your room request and have a number of room preferences in mind and also know what kind of classroom you'll need – e.g. how big? do you need a projector? bCourse access? Individual desks, or a conference room layout?</li>
                    <li><strong>Signatures:</strong> This is the most crucial part of your CPF. Make sure you have it signed by appropriate personnel!
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li><strong>Student Course Facilitators:</strong> Your Signature</li>
                        <li><strong>Department Chair:</strong> The department chair is responsible for making the final decision of whether or not your course is appropriate. Contact the staff in your department to understand the department procedures. Drop by the department office or contact the department staff. Don't forget to include a copy of your course syllabus! The person in position may differ from year to year. Obtain the information from your department website or department contacts.</li>
                      </ul>
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Attend a Workshop</h3>
                  <p className="text-gray-700 mb-4">
                    All new facilitators must attend a workshop offered through the Student Learning Center. The list of workshop dates can be found here. For more information about these workshops, please contact UCFTR at slc-ucftr@berkeley.edu.
                  </p>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Turn in Your CPF</h3>
                  <p className="text-gray-700 mb-4">
                    You must turn in your CPF (with your sponsor's signature), syllabus, and faculty sponsor's letter of support to your department. If the department approves your course, either they or you (please double check with your department) will send it to the Academic Senate for final approval.
                  </p>
                  <p className="text-gray-700 mb-4">
                    To get your course listed on our website, you must create an account and "submit a course for approval"; you will upload your course description, syllabus, and fully signed CPF and then the DeCal Board will approve your course shortly after.
                  </p>
                </section>

                <section>
                  <h3 className="text-[#003262] mb-4">Publicize Your Course</h3>
                  <p className="text-gray-700 mb-4">
                    Once your course has been approved, you may submit this Google Form form so we can advertise your course on the DeCal Board Facebook page.
                  </p>
                </section>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
