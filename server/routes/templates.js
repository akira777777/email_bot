import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const toCamelCase = (row) => ({
  id: row.id,
  name: row.name,
  subject: row.subject,
  body: row.body,
  createdAt: row.created_at
});

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows.map(toCamelCase));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    const result = await query(
      'INSERT INTO templates (name, subject, body) VALUES ($1, $2, $3) RETURNING *',
      [name, subject, body]
    );
    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subject, body } = req.body;
  try {
    const result = await query(
      'UPDATE templates SET name = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *',
      [name, subject, body, id]
    );
    res.json(toCamelCase(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM templates WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
