import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const nodemailerModule = nodemailer.default || nodemailer;
    transporter = nodemailerModule.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

export const sendApprovalEmail = async (facilitatorEmails, courseTitle) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: facilitatorEmails.join(', '),
      subject: `DeCal Course Approved: ${courseTitle}`,
      html: `
        <h2>Your DeCal Course Has Been Approved!</h2>
        <p>Congratulations! Your DeCal course "<strong>${courseTitle}</strong>" has been approved and is now live on the DeCal website.</p>
        <p>Students can now view and enroll in your course.</p>
        <p>If you have any questions, please contact the DeCal administrators.</p>
      `
    };

    const info = await getTransporter().sendMail(mailOptions);
    return { success: true, messageId: info.messageId, error: null };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error, messageId: null };
  }
};

export const sendRejectionEmail = async (facilitatorEmails, courseTitle, feedback) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: facilitatorEmails.join(', '),
      subject: `DeCal Course Submission Feedback: ${courseTitle}`,
      html: `
        <h2>DeCal Course Submission Feedback</h2>
        <p>Thank you for submitting your DeCal course "<strong>${courseTitle}</strong>".</p>
        <p>After review, we need some additional information or changes before we can approve your course.</p>
        <h3>Feedback:</h3>
        <p>${feedback || 'Please review your submission and ensure all required fields are complete and accurate.'}</p>
        <p>You can edit and resubmit your course through the DeCal submission portal.</p>
        <p>If you have any questions, please contact the DeCal administrators.</p>
      `
    };

    const info = await getTransporter().sendMail(mailOptions);
    return { success: true, messageId: info.messageId, error: null };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error, messageId: null };
  }
};

