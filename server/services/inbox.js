import { query } from '../db.js';
import { generateDraft } from './ai.js';

const toCamelCase = (row) => ({
  id: row.id,
  contactId: row.contact_id,
  content: row.content,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  companyName: row.company_name,
  email: row.email,
  contactPerson: row.contact_person
});

export const InboxService = {
  async getDrafts() {
    const result = await query(`
      SELECT m.*, c.company_name, c.email, c.contact_person
      FROM messages m
      JOIN contacts c ON m.contact_id = c.id
      WHERE m.status = 'draft'
      ORDER BY m.created_at DESC
    `);
    return result.rows.map(toCamelCase);
  },

  async getHistory(contactId) {
    const result = await query(
      "SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at ASC",
      [contactId]
    );
    return result.rows.map(toCamelCase);
  },

  async simulateIncoming(contactId, content) {
    // 1. Save incoming message
    await query(
      "INSERT INTO messages (contact_id, content, role, status) VALUES ($1, $2, 'user', 'received')",
      [contactId, content]
    );

    // 2. Fetch history
    const historyRes = await query(
      "SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at ASC",
      [contactId]
    );
    
    // 3. Generate Draft
    const contactRes = await query("SELECT * FROM contacts WHERE id = $1", [contactId]);
    const contact = contactRes.rows[0];
    if (!contact) throw new Error('Contact not found');

    const draftContent = await generateDraft(contact.contact_person || contact.company_name, historyRes.rows);

    // 4. Save Draft
    const draftRes = await query(
      "INSERT INTO messages (contact_id, content, role, status) VALUES ($1, $2, 'draft', 'draft') RETURNING *",
      [contactId, draftContent]
    );

    return toCamelCase(draftRes.rows[0]);
  },

  async approveDraft(id, content) {
    let result;
    if (content) {
      result = await query(
        "UPDATE messages SET status = 'sent', role = 'assistant', content = $2 WHERE id = $1 RETURNING *",
        [id, content]
      );
    } else {
      result = await query(
        "UPDATE messages SET status = 'sent', role = 'assistant' WHERE id = $1 RETURNING *",
        [id]
      );
    }
    
    if (result.rows.length === 0) {
      const error = new Error('Draft not found');
      error.status = 404;
      throw error;
    }
    
    return toCamelCase(result.rows[0]);
  },

  async rejectDraft(id) {
    const result = await query("DELETE FROM messages WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      const error = new Error('Draft not found');
      error.status = 404;
      throw error;
    }
    return { success: true };
  }
};
