import { query } from '../db.js';

export const CampaignService = {
  async sendCampaign(contactIds, templateId) {
    const results = [];
    for (const contactId of contactIds) {
      // 1. Log outbound message
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
    return { success: true, sentCount: results.length };
  }
};
