export interface Contact {
  id: string;
  companyName: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  status: 'new' | 'sent' | 'opened' | 'replied' | 'bounced';
  lastContacted?: Date;
  notes?: string;
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  contacts: string[];
  sentCount: number;
  openedCount: number;
  repliedCount: number;
  createdAt: Date;
  scheduledAt?: Date;
}

export interface EmailStats {
  totalContacts: number;
  emailsSent: number;
  emailsOpened: number;
  replies: number;
  bounced: number;
}
