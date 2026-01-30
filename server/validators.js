import { z } from 'zod';

export const contactSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

export const bulkContactSchema = z.array(contactSchema);

export const templateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export const campaignSchema = z.object({
  contactIds: z.array(z.string().uuid()),
  templateId: z.string().uuid(),
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
  }
};
