import { query } from '../db.js';

const toCamelCase = (row) => ({
  id: row.id,
  companyName: row.company_name,
  email: row.email,
  contactPerson: row.contact_person,
  phone: row.phone,
  status: row.status,
  lastContacted: row.last_contacted,
  notes: row.notes,
  createdAt: row.created_at
});

export const ContactService = {
  async getAll() {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    return result.rows.map(toCamelCase);
  },

  async create(data) {
    const { companyName, email, contactPerson, phone } = data;
    const result = await query(
      'INSERT INTO contacts (company_name, email, contact_person, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyName, email, contactPerson, phone]
    );
    return toCamelCase(result.rows[0]);
  },

  async bulkCreate(contacts) {
    const results = [];
    for (const contact of contacts) {
      const { companyName, email, contactPerson, phone } = contact;
      const result = await query(
        'INSERT INTO contacts (company_name, email, contact_person, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET company_name = EXCLUDED.company_name RETURNING *',
        [companyName, email, contactPerson, phone]
      );
      results.push(toCamelCase(result.rows[0]));
    }
    return results;
  },

  async delete(id) {
    await query('DELETE FROM contacts WHERE id = $1', [id]);
    return { success: true };
  }
};
