const db = require('../services/database');

class UserRepository {
  async createUser(email, passwordHash) {
    const query = `
      INSERT INTO users (email, password_hash, email_verified)
      VALUES ($1, $2, false)
      RETURNING id
    `;
    const result = await db.query(query, [email, passwordHash]);
    return result.rows[0];
  }

  async findUserByEmail(email) {
    const query = `
      SELECT u.*, p.full_name, p.user_type, ur.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  async findUserById(id) {
    const query = `
      SELECT u.*, p.full_name, p.user_type, ur.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async createProfile(userId, email, fullName, userType) {
    const query = `
      INSERT INTO profiles (user_id, email, full_name, user_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [userId, email, fullName, userType]);
    return result.rows[0];
  }

  async assignRole(userId, role, userType) {
    const query = `
      INSERT INTO user_roles (user_id, role, user_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [userId, role, userType]);
    return result.rows[0];
  }

  async updateEmailVerificationToken(userId, token) {
    const query = `
      UPDATE users 
      SET email_verification_token = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [userId, token]);
    return result.rows[0];
  }

  async verifyEmail(token) {
    const query = `
      UPDATE users 
      SET email_verified = true, email_verification_token = NULL
      WHERE email_verification_token = $1
      RETURNING *
    `;
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  async updatePasswordResetToken(userId, token, expiresAt) {
    const query = `
      UPDATE users 
      SET password_reset_token = $2, password_reset_expires = $3
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [userId, token, expiresAt]);
    return result.rows[0];
  }

  async resetPassword(token, passwordHash) {
    const query = `
      UPDATE users 
      SET password_hash = $2, password_reset_token = NULL, password_reset_expires = NULL
      WHERE password_reset_token = $1 AND password_reset_expires > NOW()
      RETURNING *
    `;
    const result = await db.query(query, [token, passwordHash]);
    return result.rows[0];
  }

  async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  async getUserProfile(userId) {
    const query = `
      SELECT u.*, p.full_name, p.user_type, ur.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  async updateUserProfile(userId, profileData) {
    const query = `
      UPDATE profiles 
      SET full_name = $2, user_type = $3, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `;
    const result = await db.query(query, [userId, profileData.full_name, profileData.user_type]);
    return result.rows[0];
  }
}

module.exports = new UserRepository(); 