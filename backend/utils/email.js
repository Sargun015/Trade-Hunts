import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  // host: process.env.EMAIL_HOST,
  // port: process.env.EMAIL_PORT,
  // secure: process.env.EMAIL_SECURE === 'true',
  // auth: {
  //   user: process.env.EMAIL_USER,
  //   pass: process.env.EMAIL_PASS
  // }

  service:'gmail',
  auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS
  },
  tls: {
      rejectUnauthorized: false
  }
});

// Send verification email with token
export const sendVerificationEmail = async (email, token, firstName) => {
  const mailOptions = {
    from: `"Freelancer Skill Exchange" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${firstName},</h2>
        <p>Thank you for registering with Freelancer Skill Exchange. Please use the verification token below to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
            ${token.substring(0, 6)}
          </div>
        </div>
        <p>Enter this token on the verification page to complete your registration.</p>
        <p>This token will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Freelancer Skill Exchange Team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};

// Send password reset email with token
export const sendPasswordResetEmail = async (email, token, firstName) => {
  const mailOptions = {
    from: `"Freelancer Skill Exchange" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${firstName},</h2>
        <p>We received a request to reset your password. Use the token below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
            ${token.substring(0, 6)}
          </div>
        </div>
        <p>Enter this token on the password reset page to set a new password.</p>
        <p>This token will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The Freelancer Skill Exchange Team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
};

// Send service request notification
// Send service request notification
export const sendServiceRequestNotification = async (email, requesterName) => {
  const mailOptions = {
    from: `"Freelancer Skill Exchange" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'New Service Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Service Request</h2>
        <p>Hello,</p>
        <p>${requesterName} has sent you a service request</strong></p>
        <p>Log in to your account to view the details and respond to this request.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Request</a>
        </div>
        <p>Best regards,<br>The Freelancer Skill Exchange Team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending service request notification:', error);
    return { success: false, error };
  }
};