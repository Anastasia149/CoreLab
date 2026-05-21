const pool = require('../db');

class UserModel {
  // role: 'student' | 'teacher'
  async create(name, email, password, activationLink, role = 'student') {
    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, activation_link, role, avatar)
      VALUES ($1, $2, $3, $4, $5, NULL)
      RETURNING *
      `,
      [name, email, password, activationLink, role]
    );

    return result.rows[0];
  }

  async findById(id){
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    return result.rows[0];
  }

  async findByActivationLink(activationLink) {
    const result = await pool.query(
      `SELECT * FROM users WHERE activation_link = $1 LIMIT 1`,
      [activationLink]
    );

    return result.rows[0];
  }

  async activateUser(activationLink) {
    await pool.query(
      `UPDATE users SET is_activated = true WHERE activation_link = $1`,
      [activationLink]
    );
  }

  async getAllUsers() {
    const result = await pool.query(
      `SELECT * FROM users`
    );
    return result.rows;
  }

  async updateProfile(id, { name, email, avatar, about_me, certificates, career }) {
    await pool.query(
      `UPDATE users SET name = $1, email = $2, avatar = $3, about_me = $4, certificates = $5, career = $6 WHERE id = $7`,
      [name, email, avatar, about_me, certificates, career, id]
    );
  }

  async deleteById(id) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

}

module.exports = new UserModel();
