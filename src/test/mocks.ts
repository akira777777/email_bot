import { Contact, EmailTemplate } from '@/types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    companyName: 'Test Company',
    email: 'test@example.com',
    contactPerson: 'John Doe',
    phone: '+1234567890',
    status: 'new',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    companyName: 'Another Corp',
    email: 'info@another.com',
    contactPerson: 'Jane Smith',
    status: 'sent',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    companyName: 'Third Inc',
    email: 'hello@third.com',
    status: 'replied',
    createdAt: new Date('2024-01-03'),
  },
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: 't1',
    name: 'Welcome Template',
    subject: 'Welcome to {{company}}',
    body: 'Hello {{contact}}, welcome!',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 't2',
    name: 'Follow-up Template',
    subject: 'Following up with {{company}}',
    body: 'Hi {{contact}}, just checking in.',
    createdAt: new Date('2024-01-02'),
  },
];

export const mockDrafts = [
  {
    id: 'd1',
    contactId: '1',
    content: 'Draft response content',
    role: 'draft' as const,
    status: 'draft',
    createdAt: new Date().toISOString(),
    companyName: 'Test Company',
    contactPerson: 'John Doe',
  },
];

export const mockMessages = [
  {
    id: 'm1',
    contactId: '1',
    content: 'Hello, I need help',
    role: 'user' as const,
    status: 'received',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    contactId: '1',
    content: 'Draft response',
    role: 'draft' as const,
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

export function createMockFetch(response: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
  });
}

export function createMockFetchError(message = 'Network error') {
  return vi.fn().mockRejectedValue(new Error(message));
}
