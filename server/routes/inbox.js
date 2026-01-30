import express from 'express';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { approveDraftSchema } from '../schemas/index.js';
import { InboxService } from '../services/inbox.js';

const router = express.Router();

// Get all drafts
router.get('/drafts', asyncHandler(async (req, res) => {
  const drafts = await InboxService.getDrafts();
  res.json(drafts);
}));

// Get conversation history
router.get('/messages/:contactId', asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const history = await InboxService.getHistory(contactId);
  res.json(history);
}));

// Simulate incoming message
router.post('/simulate-incoming', asyncHandler(async (req, res) => {
  const { contactId, content } = req.body;
  const draft = await InboxService.simulateIncoming(contactId, content);
  res.json(draft);
}));

// Approve draft
router.post('/drafts/:id/approve', validate(approveDraftSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const result = await InboxService.approveDraft(id, content);
  res.json(result);
}));

// Reject/Delete draft
router.delete('/drafts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await InboxService.rejectDraft(id);
  res.json(result);
}));

export default router;
