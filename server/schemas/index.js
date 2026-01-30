import { z } from 'zod';

export const contactSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

export const bulkContactSchema = z.array(contactSchema);

export const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});

export const campaignSendSchema = z.object({
  contactIds: z.array(z.string().uuid("Invalid contact ID")),
  templateId: z.string().uuid("Invalid template ID"),
});

export const approveDraftSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
});
