import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';

// Send OTP to the user's email
export const sendOTP = async (user) => {
  // Generate OTP using speakeasy
  const otp = speakeasy.totp({
    secret: process.env.OTP_SECRET, // Secret key for OTP generation
    encoding: 'base32',
  });

  // Create a transporter for nodemailer
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email content
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  user.otp = otp

  await user.save()
  // Send OTP via email
  await transporter.sendMail(mailOptions);

  // Store OTP in memory with an expiration time of 5 minutes (300 seconds)

  return 'OTP sent successfully! Please check your email.';
};

// Verify the OTP entered by the user
export const verifyOTP = (userOtp, enteredOtp) => {
  // Verify if the OTP has expired (if it's over 5 minutes, for example)
  const otpGeneratedTime = userOtp.createdAt; // assuming you save the creation time of OTP when it's generated
  const expirationTime = 1 * 60 * 1000; // 1 minute in milliseconds
  
  const currentTime = new Date().getTime();
  if (currentTime - otpGeneratedTime > expirationTime) {
      return false;  // OTP expired
  }

  // Verify the entered OTP
  if (userOtp === enteredOtp) {
    console.log(`OTP : ${userOtp} | Entered OTP : ${enteredOtp}`);
    return true;  
  }

  return false;  
};
