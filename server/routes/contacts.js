import express from 'express';
import { query } from '../db.js';

const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows.map(toCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { companyName, email, contactPerson, phone } = req.body;
  try {
    const result = await query(
      'INSERT INTO contacts (company_name, email, contact_person, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyName, email, contactPerson, phone]
    );
    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  const contacts = req.body; // Array of contact objects
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Data must be an array' });
  }

  try {
    const results = [];
    // Using a transaction-like approach for bulk insert
    // For simplicity with pg-pool, we can use a single multi-row insert or a loop with query
    // Let's use a loop for now but within a single endpoint to reduce roundtrips from frontend
    for (const contact of contacts) {
      const { companyName, email, contactPerson, phone } = contact;
      const result = await query(
        'INSERT INTO contacts (company_name, email, contact_person, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET company_name = EXCLUDED.company_name RETURNING *',
        [companyName, email, contactPerson, phone]
      );
      results.push(toCamelCase(result.rows[0]));
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM contacts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
