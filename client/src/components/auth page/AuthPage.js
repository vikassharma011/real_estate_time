import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Grid2
} from '@mui/material';

const signupInitialValue = {
  First_Name: '',
  Last_Name: '',
  Email: '',
  Password: '',
  Phone_Number: '',
};

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [signup, setSignup] = useState(signupInitialValue);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State for forgot password flow
  const [newPassword, setNewPassword] = useState('');
  const [emailForPasswordReset, setEmailForPasswordReset] = useState('');
  const [error, setError] = useState('');

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
  };

  const signupChange = (e) => {
    setSignup({ ...signup, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5004/auth/signup', signup);
      if (response.data.success) {
        alert('Verification code sent to your email.');
        setIsCodeSent(true);
      } else {
        alert('Error during sign-up: ' + response.data.message);
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      alert('An error occurred during sign-up.');
    }
  };

  const handleVerification = async () => {
    try {
      const response = await axios.post('http://localhost:5004/auth/verify-email', {
        email: signup.Email,
        code: verificationCode,
      });
      if (response.data.success) {
        alert('Email verified successfully!');
        setIsCodeSent(false);
      } else {
        alert('Verification failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('An error occurred during verification.');
    }
  };

  const handleLogin = async () => {
    try {
      const loginData = {
        email: signup.Email,
        password: signup.Password,
      };
      const response = await axios.post('http://localhost:5004/auth/login', loginData);
      if (response.data.success) {
        alert('Login successful!');
        // Store the JWT token in localStorage
        localStorage.setItem('token', response.data.token);
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true); // Show the forgot password form
  };

  const handleSendOTP = async () => {
    try {
      const response = await axios.post('http://localhost:5004/auth/send-otp', { email: emailForPasswordReset });
      if (response.data.success) {
        alert('OTP sent to your email.');
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('An error occurred while sending OTP.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5004/auth/reset-password', {
        email: emailForPasswordReset,
        otp: verificationCode,
        newPassword: newPassword,
      });
      if (response.data.success) {
        alert('Password reset successfully!');
        setIsForgotPassword(false); // Close the forgot password form
        setIsSignUp(true); 
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('An error occurred during password reset.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundImage:
          'url(https://www.jll.co.in/images/global/jll-future-vision-real-estate-social-1200x628.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Grid2
        container
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: '#fff',
            borderRadius: 2,
            padding: 4,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 2, color: '#000', textAlign: 'center' }}
          >
            {isForgotPassword ? 'Forgot Password' : isSignUp ? 'Sign up with Real_estate' : 'Log in to Real_estate'}
          </Typography>
          <Divider sx={{ my: 2 }}>OR</Divider>

          {isForgotPassword ? (
            <>
              <TextField
                label="Enter your Email"
                type="email"
                fullWidth
                required
                variant="outlined"
                margin="normal"
                onChange={(e) => setEmailForPasswordReset(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, textTransform: 'none' }}
                onClick={handleSendOTP}
              >
                Send OTP
              </Button>

              <TextField
                label="Enter OTP"
                fullWidth
                required
                variant="outlined"
                margin="normal"
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                variant="outlined"
                margin="normal"
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3, textTransform: 'none' }}
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            
            </>
          ) : (
            <>
              {isCodeSent ? (
                <>
                  <Typography sx={{ mb: 2, color: '#000' }}>
                    Enter the verification code sent to your email:
                  </Typography>
                  <TextField
                    label="Verification Code"
                    fullWidth
                    required
                    variant="outlined"
                    margin="normal"
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3, textTransform: 'none' }}
                    onClick={handleVerification}
                  >
                    Verify Email
                  </Button>
                </>
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      <TextField
                        label="First Name"
                        name="First_Name"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                      <TextField
                        label="Last Name"
                        name="Last_Name"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        name="Email"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                      <TextField
                        label="Password"
                        type="password"
                        name="Password"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                      <TextField
                        label="Phone Number"
                        name="Phone_Number"
                        type="tel"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        label="Email"
                        type="email"
                        name="Email"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                      <TextField
                        label="Password"
                        type="password"
                        name="Password"
                        fullWidth
                        required
                        variant="outlined"
                        margin="normal"
                        onChange={signupChange}
                      />
                    </>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3, textTransform: 'none' }}
                    onClick={isSignUp ? handleSignup : handleLogin}
                  >
                    {isSignUp ? 'Sign Up' : 'Log In'}
                  </Button>
                </>
              )}
            </>
          )}

          <Typography
            sx={{
              mt: 2,
              textAlign: 'center',
              fontSize: '0.875rem',
              cursor: 'pointer',
              color: 'blue',
              textDecoration: 'underline',
            }}
            onClick={toggleForm}
          >
            {isSignUp
              ? 'Already have an account? Log in here.'
              : "Don't have an account? Sign up here."}
          </Typography>
          {!isForgotPassword && (
            <Typography
              sx={{
                mt: 2,
                textAlign: 'center',
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: 'blue',
                textDecoration: 'underline',
              }}
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </Typography>
          )}
          <Typography
            sx={{
              mt: 4,
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#666',
            }}
          >
            © 2025 v2.7.1
          </Typography>
        </Box>
      </Grid2>
    </Box>
  );
};

export default AuthPage;
