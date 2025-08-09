const JWTService = require('../auth/jwt');
const userRepository = require('../repositories/userRepository');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header provided" });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    // Verify JWT token
    const decoded = JWTService.verifyAccessToken(token);
    
    // Get user from database
    const user = await userRepository.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Check if email is verified (optional, can be disabled for testing)
    if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      return res.status(403).json({ error: "Email not verified" });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      user_type: user.user_type,
      role: user.role,
      email_verified: user.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.message === 'Invalid access token') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = {
  authenticateUser
}; 