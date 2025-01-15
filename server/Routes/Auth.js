import express from "express" ;
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt" ;  
import crypto from "crypto" ;
import jwt from "jsonwebtoken";

const router = express.Router() ;

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    verificationCode: { type: String }, // Stores the verification code
    isVerified: { type: Boolean, default: false }, // Indicates if the user is verified
  });
  
  const User = mongoose.model('User', userSchema);
  

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your email service
  auth: {
    user: 'vikassharma4733@gmail.com', // Replace with your email address
    pass: 'mjkk wnni squj umst', // Replace with your email password or app password
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying transporter:', error);
  } else {
    console.log('Transporter is ready to send emails:', success);
  }
});
router.post('/signup', async (req, res) => {
  const { First_Name, Last_Name, Email, Password, Phone_Number } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email: Email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Generate a random verification code
    const verificationCode = crypto.randomBytes(3).toString('hex');

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(Password, 10); // 10 is the salt rounds

    // Save the user with `isVerified: false` and hashed password
    const newUser = new User({
      firstName: First_Name,
      lastName: Last_Name,
      email: Email,
      password: hashedPassword,
      phoneNumber: Phone_Number,
      verificationCode,
      isVerified: false,
    });

    await newUser.save();

    // Send the verification code via email
    const mailOptions = {
      from: 'vikassharma4733@gmail.com',
      to: Email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ success: false, message: 'Error sending verification email' });
      }
      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
      });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});


router.post('/verify-email', async (req, res) => {
    const { email, code } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified' });
      }
  
      if (user.verificationCode !== code) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
      }
  
      // Mark the user as verified
      user.isVerified = true;
      user.verificationCode = null; // Clear the verification code
      await user.save();
  
      res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      console.error('Error during verification:', error);
      res.status(500).json({ success: false, message: 'Server error during verification' });
    }
  });
  
  const JWT_SECRET = 'Random';  // You should store this in environment variables

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email not verified' });
      }
  
      // Compare the entered password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }  // Token expires in 1 hour
      );
  
      // Send the token to the client
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  });


let otpStore = {}; // Store OTPs temporarily



// Route to send OTP to the email for password reset
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email }); // Use findOne() instead of find()
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
  
      // Store OTP temporarily
      otpStore[email] = otp;
  
      // Send OTP email
      const mailOptions = {
        from: 'vikassharma4733@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for resetting your password is: ${otp}`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Error sending OTP' });
        }
        res.json({ success: true, message: 'OTP sent to your email' });
      });
    } catch (error) {
      console.error('Error during OTP sending:', error);
      res.status(500).json({ success: false, message: 'Server error during OTP sending' });
    }
  });
  

// Route to verify OTP and reset password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      // Verify the OTP
      if (otpStore[email] !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
  
      // Find user by email
      const user = await User.findOne({ email }); // Use findOne() here too
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
  
      // Save the updated user
      await user.save();
  
      // Delete OTP after reset
      delete otpStore[email];
  
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ success: false, message: 'Server error during password reset' });
    }
  });
  

export {router as auth} ; 