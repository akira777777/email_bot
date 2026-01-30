import express from 'express';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { templateSchema } from '../schemas/index.js';
import { TemplateService } from '../services/templates.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const templates = await TemplateService.getAll();
  res.json(templates);
}));

router.post('/', validate(templateSchema), asyncHandler(async (req, res) => {
  const template = await TemplateService.create(req.body);
  res.json(template);
}));

router.put('/:id', validate(templateSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await TemplateService.update(id, req.body);
  res.json(template);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TemplateService.delete(id);
  res.json(result);
}));

export default router;
