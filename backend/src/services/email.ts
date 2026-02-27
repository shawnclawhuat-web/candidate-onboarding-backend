import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
};

export const sendOnboardingEmail = async (
  email: string,
  candidateName: string,
  adminName: string,
  onboardingLink: string
) => {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'Candidate Portal <onboarding@resend.dev>',
      to: email,
      subject: 'Complete Your Candidate Profile',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome, ${candidateName || 'Candidate'}!</h1>
            </div>
            <div class="content">
              <p>Hello ${candidateName || 'there'},</p>
              <p><strong>${adminName}</strong> has created your candidate profile and invited you to join our system.</p>
              <p>Please complete your profile by clicking the button below:</p>
              <p style="text-align: center;">
                <a href="${onboardingLink}" class="button">Complete Your Profile</a>
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                ⏰ This link will expire in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't expect this email, please ignore it.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return result;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};
