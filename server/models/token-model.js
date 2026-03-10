const pool = require('../db');

class TokenModel {
  async save(userId, refreshToken) {
    const result = await pool.query(
      `
      INSERT INTO tokens (user_id, refresh_token)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET refresh_token = $2
      RETURNING *
      `,
      [userId, refreshToken]
    );

    return result.rows[0];
  }

  async findByUserId(userId) {
    const result = await pool.query(
      `
      SELECT * FROM tokens
      WHERE user_id = $1
      `,
      [userId]
    );

    return result.rows[0];
  }

  async findByRefreshToken(refreshToken) {
    const result = await pool.query(
      `
      SELECT * FROM tokens
      WHERE refresh_token = $1
      `,
      [refreshToken]
    );

    return result.rows[0];
  }

  async deleteByUserId(userId) {
    await pool.query(
      `
      DELETE FROM tokens
      WHERE user_id = $1
      `,
      [userId]
    );
  }

  async removeToken(refreshToken) {
    const result = await pool.query(
      `
      DELETE FROM tokens
      WHERE refresh_token = $1
      RETURNING *
      `,
      [refreshToken]
    );

    return result.rows[0];
  }
  }

module.exports = new TokenModel();
