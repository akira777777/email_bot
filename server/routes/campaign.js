import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.post('/send', async (req, res) => {
  const { contactIds, templateId } = req.body;

  try {
    // In a real app, fetch template content
    // const templateRes = await query('SELECT * FROM templates WHERE id = $1', [templateId]);
    // const template = templateRes.rows[0];

    // For each contact, "send" email and log message
    const results = [];
    for (const contactId of contactIds) {
      // 1. Log outbound message
      // We are just logging a placeholder content for now as we don't have the full template body in request
      // Ideally fetching template body from DB would be better
      await query(
        "INSERT INTO messages (contact_id, content, role, status) VALUES ($1, $2, 'assistant', 'sent')",
        [contactId, `[Campaign Email] Template ID: ${templateId}`]
      );

      // 2. Update contact status
      await query(
        "UPDATE contacts SET status = 'sent', last_contacted = NOW() WHERE id = $1",
        [contactId]
      );
      results.push(contactId);
    }

    res.json({ success: true, sentCount: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
