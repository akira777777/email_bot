import { query } from '../db.js';
import { EmailService } from './email.js';
import { TemplateService } from './templates.js';

export const CampaignService = {
  async sendCampaign(contactIds, templateId) {
    const template = await TemplateService.getById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const results = [];

    // Fetch contacts info
    const contactsQuery = await query(
      'SELECT * FROM contacts WHERE id = ANY($1)',
      [contactIds]
    );
    const contacts = contactsQuery.rows;

    for (const contact of contacts) {
      try {
        // Simple variable substitution
        let body = template.body
          .replace(/{{name}}/g, contact.contact_person || '')
          .replace(/{{company}}/g, contact.company_name || '');

        let subject = template.subject
          .replace(/{{name}}/g, contact.contact_person || '')
          .replace(/{{company}}/g, contact.company_name || '');

        await EmailService.sendEmail(contact.email, subject, body);

        // 1. Log outbound message
        await query(
          "INSERT INTO messages (contact_id, content, role, status) VALUES ($1, $2, 'assistant', 'sent')",
          [contact.id, body]
        );

        // 2. Update contact status
        await query(
          "UPDATE contacts SET status = 'sent', last_contacted = NOW() WHERE id = $1",
          [contact.id]
        );
        results.push(contact.id);
      } catch (error) {
        console.error(`Failed to send email to ${contact.email}:`, error);
        // Optionally update status to 'bounced' or log error
        await query(
          "UPDATE contacts SET status = 'bounced' WHERE id = $1",
          [contact.id]
        );
      }
    }
    return { success: true, sentCount: results.length };
  }
};
