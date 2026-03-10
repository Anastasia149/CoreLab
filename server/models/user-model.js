const pool = require('../db');

class UserModel {
  // role: 'student' | 'teacher'
  async create(name, email, password, activationLink, role = 'student') {
    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, activation_link, role)
      VALUES ($1, $2, $3, $4, $5)
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

}

module.exports = new UserModel();
