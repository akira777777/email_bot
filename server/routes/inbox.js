import express from 'express';
import { query } from '../db.js';
import { generateDraft } from '../services/ai.js';

const router = express.Router();

const toCamelCase = (row) => ({
  id: row.id,
  contactId: row.contact_id,
  content: row.content,
  role: row.role,
  status: row.status,
  createdAt: row.created_at,
  // Enriched fields if present
  companyName: row.company_name,
  email: row.email,
  contactPerson: row.contact_person
});

// Get all drafts
router.get('/drafts', async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, c.company_name, c.email, c.contact_person
      FROM messages m
      JOIN contacts c ON m.contact_id = c.id
      WHERE m.status = 'draft'
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows.map(toCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get conversation history
router.get('/messages/:contactId', async (req, res) => {
  const { contactId } = req.params;
  try {
    const result = await query(
      "SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at ASC",
      [contactId]
    );
    res.json(result.rows.map(toCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate incoming message
router.post('/simulate-incoming', async (req, res) => {
  const { contactId, content } = req.body;

  try {
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
    const history = historyRes.rows;

    // 3. Generate Draft
    const contactRes = await query("SELECT * FROM contacts WHERE id = $1", [contactId]);
    const contact = contactRes.rows[0];

    if (!contact) {
      throw new Error('Contact not found');
    }

    const draftContent = await generateDraft(contact.contact_person || contact.company_name, history);

    // 4. Save Draft
    const draftRes = await query(
      "INSERT INTO messages (contact_id, content, role, status) VALUES ($1, $2, 'draft', 'draft') RETURNING *",
      [contactId, draftContent]
    );

    res.json(toCamelCase(draftRes.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Approve draft
router.post('/drafts/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    // Update draft to 'assistant' role and 'queued' status
    // In real app, we'd trigger Resend/SendGrid here
    await query(
      "UPDATE messages SET status = 'sent', role = 'assistant' WHERE id = $1",
      [id]
    );

    // Fetch updated message to return
    const result = await query("SELECT * FROM messages WHERE id = $1", [id]);
    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject/Delete draft
router.delete('/drafts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM messages WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
