import express from 'express';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { contactSchema, bulkContactSchema } from '../schemas/index.js';
import { ContactService } from '../services/contacts.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const contacts = await ContactService.getAll();
  res.json(contacts);
}));

router.post('/', validate(contactSchema), asyncHandler(async (req, res) => {
  const contact = await ContactService.create(req.body);
  res.json(contact);
}));

router.post('/bulk', validate(bulkContactSchema), asyncHandler(async (req, res) => {
  const results = await ContactService.bulkCreate(req.body);
  res.json(results);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ContactService.delete(id);
  res.json(result);
}));

export default router;
