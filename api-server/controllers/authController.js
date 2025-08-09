const authService = require('../services/authService');
const { asyncHandler, ValidationError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');

class AuthController {
  register = asyncHandler(async (req, res) => {
    const userData = req.body;
    const user = await authService.registerUser(userData);

    res.json({
      success: true,
      data: {
        user,
        message: "Registration successful. Please check your email to verify your account."
      }
    });
  });

  login = asyncHandler(async (req, res) => {
    console.log('🔍 LOGIN DEBUG - Full request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 LOGIN DEBUG - Email from destructuring:', req.body.email);
    console.log('🔍 LOGIN DEBUG - Password from destructuring:', req.body.password);
    
    const { email, password } = req.body;
    console.log('🔍 LOGIN DEBUG - Destructured email:', email);
    console.log('🔍 LOGIN DEBUG - Destructured password:', password);
    
    const result = await authService.loginUser(email, password);

    res.json({
      success: true,
      data: result
    });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;
    await authService.verifyEmail(token);

    res.json({
      success: true,
      data: {
        message: "Email verified successfully. Welcome to Refi Wizard!"
      }
    });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await authService.forgotPassword(email);

    res.json({
      success: true,
      data: {
        message: "If an account with this email exists, a password reset link has been sent."
      }
    });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, new_password } = req.body;
    await authService.resetPassword(token, new_password);

    res.json({
      success: true,
      data: {
        message: "Password reset successfully. You can now login with your new password."
      }
    });
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    const result = await authService.refreshToken(refresh_token);

    res.json({
      success: true,
      data: result
    });
  });

  logout = asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    await authService.logout(refresh_token);

    res.json({
      success: true,
      data: {
        message: "Logged out successfully"
      }
    });
  });

  getUserProfile = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user
    });
  });

  updateUserProfile = asyncHandler(async (req, res) => {
    const updatedProfile = await authService.updateUserProfile(req.user.id, req.body);

    res.json({
      success: true,
      data: updatedProfile
    });
  });
}

module.exports = new AuthController(); 