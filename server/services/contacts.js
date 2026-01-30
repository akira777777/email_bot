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

  async create({ companyName, email, contactPerson, phone }) {
    const result = await query(
      'INSERT INTO contacts (company_name, email, contact_person, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyName, email, contactPerson, phone]
    );
    return toCamelCase(result.rows[0]);
  },

  async bulkCreate(contacts) {
    if (contacts.length === 0) return [];
    
    // Build parameterized multi-row INSERT for better performance
    const values = [];
    const placeholders = contacts.map((contact, i) => {
      const offset = i * 4;
      values.push(contact.companyName, contact.email, contact.contactPerson || null, contact.phone || null);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    });
    
    const result = await query(
      `INSERT INTO contacts (company_name, email, contact_person, phone) 
       VALUES ${placeholders.join(', ')} 
       ON CONFLICT (email) DO UPDATE SET 
         company_name = EXCLUDED.company_name,
         contact_person = COALESCE(EXCLUDED.contact_person, contacts.contact_person),
         phone = COALESCE(EXCLUDED.phone, contacts.phone)
       RETURNING *`,
      values
    );
    return result.rows.map(toCamelCase);
  },

  async delete(id) {
    const result = await query('DELETE FROM contacts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      const error = new Error('Contact not found');
      error.status = 404;
      throw error;
    }
    return { success: true };
  }
};
