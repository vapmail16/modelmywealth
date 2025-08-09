const JWTService = require('../auth/jwt');
const emailService = require('./emailJS');
const userRepository = require('../repositories/userRepository');
const sessionRepository = require('../repositories/sessionRepository');

class AuthService {
  async registerUser(userData) {
    const { email, password, full_name, user_type } = userData;

    // Validate input
    if (!email || !password || !full_name || !user_type) {
      const { ValidationError } = require('../middleware/errorHandler');
      throw new ValidationError('All fields are required');
    }

    if (password.length < 8) {
      const { ValidationError } = require('../middleware/errorHandler');
      throw new ValidationError('Password must be at least 8 characters long', 'password');
    }

    // Check if user already exists
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      const { ValidationError } = require('../middleware/errorHandler');
      throw new ValidationError('User already exists', 'email');
    }

    // Hash password
    const passwordHash = await JWTService.hashPassword(password);

    // Create user
    const userResult = await userRepository.createUser(email, passwordHash);
    const userId = userResult.id;

    // Create profile
    await userRepository.createProfile(userId, email, full_name, user_type);

    // Assign default role
    const defaultRole = user_type === 'tech' ? 'user' : 'analyst';
    await userRepository.assignRole(userId, defaultRole, user_type);

    // Generate email verification token
    const verificationToken = JWTService.generateEmailVerificationToken(userId);
    await userRepository.updateEmailVerificationToken(userId, verificationToken);

    // Send verification email
    await emailService.sendEmailVerification(email, verificationToken, full_name);

    return {
      id: userId,
      email,
      name: full_name,
      user_type,
      email_verified: false
    };
  }

  async loginUser(email, password) {
    // Find user
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      const { AuthenticationError } = require('../middleware/errorHandler');
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await JWTService.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      const { AuthenticationError } = require('../middleware/errorHandler');
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = JWTService.generateAccessToken({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      role: user.role
    });

    const refreshToken = JWTService.generateRefreshToken({
      id: user.id,
      email: user.email,
      user_type: user.user_type,
      role: user.role
    });

    // Store refresh token
    await sessionRepository.createSession(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        user_type: user.user_type,
        role: user.role,
        email_verified: user.email_verified
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }
    };
  }

  async verifyEmail(token) {
    const user = await userRepository.verifyEmail(token);
    if (!user) {
      throw new Error('Invalid or expired email verification token');
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.full_name);

    return true;
  }

  async forgotPassword(email) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    // Generate reset token
    const resetToken = JWTService.generatePasswordResetToken(user.id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.updatePasswordResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    await emailService.sendPasswordReset(user.email, resetToken, user.full_name);

    return true;
  }

  async resetPassword(token, newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const passwordHash = await JWTService.hashPassword(newPassword);
    const user = await userRepository.resetPassword(token, passwordHash);

    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    return true;
  }

  async refreshToken(refreshToken) {
    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Check if session exists
    const session = await sessionRepository.findSessionByToken(refreshToken);
    if (!session) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = JWTService.generateAccessToken({
      id: session.user_id,
      email: session.email,
      user_type: session.user_type,
      role: session.role
    });

    return {
      access_token: newAccessToken,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await sessionRepository.deleteSession(refreshToken);
    }
    return true;
  }

  async getUserProfile(userId) {
    const user = await userRepository.getUserProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(userId, profileData) {
    const updatedProfile = await userRepository.updateUserProfile(userId, profileData);
    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }
    return updatedProfile;
  }
}

module.exports = new AuthService(); 