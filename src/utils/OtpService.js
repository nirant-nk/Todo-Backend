import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';

// Send OTP to the user's email
const sendOTP = async (user) => {
  // Generate OTP using speakeasy
  const otp = speakeasy.totp({
    secret: process.env.OTP_SECRET, // Secret key for OTP generation
    encoding: 'base32',
    step: 60
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
    text: `Your OTP code is ${otp}. It will expire within a minute.`,
  };

  
  if(!user.isVerified){
    user.otpExpiry = new Date(Date.now() + 60 * 1000); 
  }

  user.otp = otp

  await user.save();

  // console.log(` user at otpService : ${user}`);
  await transporter.sendMail(mailOptions)
  // console.log(await transporter.sendMail(mailOptions))
  
  return 'OTP sent successfully! Please check your email.';
};

// Verify the OTP entered by the user
const verifyOTP = (userOtp, enteredOtp) => {

  if (userOtp === enteredOtp) {
    // console.log(`OTP : ${userOtp} | Entered OTP : ${enteredOtp}`);
    return true;  
  }

  return false;  
  
};

export {
  sendOTP,
  verifyOTP
};

