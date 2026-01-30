import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentActivity } from './RecentActivity';
import { Contact } from '@/types';

describe('RecentActivity', () => {
  const createContact = (overrides: Partial<Contact> = {}): Contact => ({
    id: '1',
    companyName: 'Test Company',
    email: 'test@example.com',
    status: 'new',
    createdAt: new Date(),
    ...overrides,
  });

  const mockContacts: Contact[] = [
    createContact({ id: '1', status: 'new', companyName: 'New Corp' }),
    createContact({ id: '2', status: 'sent', companyName: 'Sent Inc', lastContacted: new Date('2024-01-02') }),
    createContact({ id: '3', status: 'opened', companyName: 'Opened Ltd', lastContacted: new Date('2024-01-03') }),
    createContact({ id: '4', status: 'replied', companyName: 'Replied Co', lastContacted: new Date('2024-01-04') }),
    createContact({ id: '5', status: 'bounced', companyName: 'Bounced GmbH', lastContacted: new Date('2024-01-01') }),
  ];

  describe('rendering', () => {
    it('should render activity header', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Последняя активность')).toBeInTheDocument();
    });

    it('should show empty state when no activity', () => {
      const newContacts = [createContact({ status: 'new' })];
      render(<RecentActivity contacts={newContacts} />);
      
      expect(screen.getByText(/пока нет активности/i)).toBeInTheDocument();
    });

    it('should show empty state when no contacts', () => {
      render(<RecentActivity contacts={[]} />);
      
      expect(screen.getByText(/пока нет активности/i)).toBeInTheDocument();
    });
  });

  describe('contact filtering', () => {
    it('should not show contacts with status new', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.queryByText('New Corp')).not.toBeInTheDocument();
    });

    it('should show contacts with status sent', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Sent Inc')).toBeInTheDocument();
    });

    it('should show contacts with status opened', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Opened Ltd')).toBeInTheDocument();
    });

    it('should show contacts with status replied', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Replied Co')).toBeInTheDocument();
    });

    it('should show contacts with status bounced', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Bounced GmbH')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('should sort by lastContacted date descending', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      const items = screen.getAllByText(/Inc|Ltd|Co|GmbH/);
      // Most recent first (Replied Co on Jan 4, then Opened Ltd on Jan 3, etc.)
      expect(items[0]).toHaveTextContent('Replied Co');
      expect(items[1]).toHaveTextContent('Opened Ltd');
    });

    it('should limit to 5 contacts', () => {
      const manyContacts = Array.from({ length: 10 }, (_, i) => 
        createContact({ 
          id: String(i), 
          status: 'sent', 
          companyName: `Company ${i}`,
          lastContacted: new Date(2024, 0, i + 1),
        })
      );
      
      render(<RecentActivity contacts={manyContacts} />);
      
      const items = screen.getAllByText(/Company \d/);
      expect(items).toHaveLength(5);
    });
  });

  describe('status labels', () => {
    it('should show Отправлено label for sent status', () => {
      const contacts = [createContact({ status: 'sent', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(screen.getByText('Отправлено')).toBeInTheDocument();
    });

    it('should show Прочитано label for opened status', () => {
      const contacts = [createContact({ status: 'opened', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(screen.getByText('Прочитано')).toBeInTheDocument();
    });

    it('should show Ответил label for replied status', () => {
      const contacts = [createContact({ status: 'replied', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(screen.getByText('Ответил')).toBeInTheDocument();
    });

    it('should show Ошибка label for bounced status', () => {
      const contacts = [createContact({ status: 'bounced', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(screen.getByText('Ошибка')).toBeInTheDocument();
    });
  });

  describe('contact details', () => {
    it('should show company name', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      expect(screen.getByText('Sent Inc')).toBeInTheDocument();
    });

    it('should show email', () => {
      render(<RecentActivity contacts={mockContacts} />);
      
      const emails = screen.getAllByText('test@example.com');
      expect(emails.length).toBeGreaterThan(0);
    });
  });

  describe('icons', () => {
    it('should show Mail icon for sent status', () => {
      const contacts = [createContact({ status: 'sent', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(document.querySelector('.lucide-mail')).toBeInTheDocument();
    });

    it('should show MailOpen icon for opened status', () => {
      const contacts = [createContact({ status: 'opened', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(document.querySelector('.lucide-mail-open')).toBeInTheDocument();
    });

    it('should show MessageSquare icon for replied status', () => {
      const contacts = [createContact({ status: 'replied', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(document.querySelector('.lucide-message-square')).toBeInTheDocument();
    });

    it('should show AlertTriangle icon for bounced status', () => {
      const contacts = [createContact({ status: 'bounced', lastContacted: new Date() })];
      render(<RecentActivity contacts={contacts} />);
      
      expect(document.querySelector('.lucide-triangle-alert')).toBeInTheDocument();
    });
  });
});
