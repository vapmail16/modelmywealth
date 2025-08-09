const db = require('../services/database');

class SessionRepository {
  async createSession(userId, tokenHash, expiresAt) {
    const query = `
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [userId, tokenHash, expiresAt]);
    return result.rows[0];
  }

  async findSessionByToken(tokenHash) {
    const query = `
      SELECT us.*, u.email, p.full_name, p.user_type, ur.role
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      WHERE us.token_hash = $1 AND us.expires_at > NOW()
    `;
    const result = await db.query(query, [tokenHash]);
    return result.rows[0];
  }

  async deleteSession(tokenHash) {
    const query = `
      DELETE FROM user_sessions 
      WHERE token_hash = $1
      RETURNING *
    `;
    const result = await db.query(query, [tokenHash]);
    return result.rows[0];
  }

  async deleteExpiredSessions() {
    const query = `
      DELETE FROM user_sessions 
      WHERE expires_at <= NOW()
    `;
    const result = await db.query(query);
    return result.rowCount;
  }

  async getUserSessions(userId) {
    const query = `
      SELECT * FROM user_sessions 
      WHERE user_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new SessionRepository(); 