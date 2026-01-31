import { query } from '../db.js';

const toCamelCase = (row) => ({
  id: row.id,
  name: row.name,
  subject: row.subject,
  body: row.body,
  createdAt: row.created_at
});

export const TemplateService = {
  async getAll() {
    const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
    return result.rows.map(toCamelCase);
  },

  async getById(id) {
    const result = await query('SELECT * FROM templates WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return toCamelCase(result.rows[0]);
  },

  async create({ name, subject, body }) {
    const result = await query(
      'INSERT INTO templates (name, subject, body) VALUES ($1, $2, $3) RETURNING *',
      [name, subject, body]
    );
    return toCamelCase(result.rows[0]);
  },

  async update(id, { name, subject, body }) {
    const result = await query(
      'UPDATE templates SET name = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *',
      [name, subject, body, id]
    );
    if (result.rows.length === 0) {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }
    return toCamelCase(result.rows[0]);
  },

  async delete(id) {
    const result = await query('DELETE FROM templates WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      const error = new Error('Template not found');
      error.status = 404;
      throw error;
    }
    return { success: true };
  }
};
