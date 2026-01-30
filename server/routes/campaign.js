import express from 'express';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { campaignSendSchema } from '../schemas/index.js';
import { CampaignService } from '../services/campaigns.js';

const router = express.Router();

router.post('/send', validate(campaignSendSchema), asyncHandler(async (req, res) => {
  const { contactIds, templateId } = req.body;
  const result = await CampaignService.sendCampaign(contactIds, templateId);
  res.json(result);
}));

export default router;
