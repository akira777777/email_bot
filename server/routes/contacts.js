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
