import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from './api';
import { mockContacts, mockTemplates, mockDrafts, mockMessages } from '@/test/mocks';

// The API uses /api prefix by default (VITE_API_URL not set in test)
const API_URL = '/api';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request helper', () => {
    it('should throw ApiError on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Bad request', code: 'BAD_REQUEST' } }),
      });

      await expect(api.contacts.getAll()).rejects.toThrow(ApiError);
      await expect(api.contacts.getAll()).rejects.toMatchObject({
        message: 'Bad request',
        status: 400,
        code: 'BAD_REQUEST',
      });
    });

    it('should handle server errors with default message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      await expect(api.contacts.getAll()).rejects.toThrow('Request failed with status 500');
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(api.contacts.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('contacts', () => {
    it('should fetch all contacts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockContacts),
      });

      const result = await api.contacts.getAll();
      expect(result).toEqual(mockContacts);
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/contacts`, undefined);
    });

    it('should create a contact', async () => {
      const newContact = { companyName: 'New Co', email: 'new@test.com' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '4', ...newContact, status: 'new' }),
      });

      const result = await api.contacts.create(newContact);
      expect(result.companyName).toBe('New Co');
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/contacts`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newContact),
        })
      );
    });

    it('should bulk create contacts', async () => {
      const contacts = [
        { companyName: 'Co 1', email: 'co1@test.com' },
        { companyName: 'Co 2', email: 'co2@test.com' },
      ];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contacts.map((c, i) => ({ id: String(i), ...c }))),
      });

      const result = await api.contacts.bulkCreate(contacts);
      expect(result).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/contacts/bulk`,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should delete a contact', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.contacts.delete('1');
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/contacts/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('templates', () => {
    it('should fetch all templates', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTemplates),
      });

      const result = await api.templates.getAll();
      expect(result).toEqual(mockTemplates);
    });

    it('should create a template', async () => {
      const template = { name: 'New', subject: 'Subject', body: 'Body' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 't3', ...template }),
      });

      const result = await api.templates.create(template);
      expect(result.name).toBe('New');
    });

    it('should update a template', async () => {
      const template = { name: 'Updated', subject: 'New Subject', body: 'New Body' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 't1', ...template }),
      });

      const result = await api.templates.update('t1', template);
      expect(result.name).toBe('Updated');
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/templates/t1`,
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should delete a template', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.templates.delete('t1');
      expect(result.success).toBe(true);
    });
  });

  describe('inbox', () => {
    it('should fetch drafts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDrafts),
      });

      const result = await api.inbox.getDrafts();
      expect(result).toEqual(mockDrafts);
    });

    it('should fetch message history', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMessages),
      });

      const result = await api.inbox.getHistory('1');
      expect(result).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/inbox/messages/1`, undefined);
    });

    it('should simulate incoming message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'd2', content: 'AI response' }),
      });

      const result = await api.inbox.simulateIncoming('1', 'Test message');
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/inbox/simulate-incoming`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ contactId: '1', content: 'Test message' }),
        })
      );
    });

    it('should approve draft with content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'd1', status: 'sent' }),
      });

      await api.inbox.approveDraft('d1', 'Edited content');
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/inbox/drafts/d1/approve`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: 'Edited content' }),
        })
      );
    });

    it('should approve draft without content', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'd1', status: 'sent' }),
      });

      await api.inbox.approveDraft('d1');
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/inbox/drafts/d1/approve`,
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });

    it('should reject draft', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.inbox.rejectDraft('d1');
      expect(result.success).toBe(true);
    });
  });

  describe('campaign', () => {
    it('should send campaign', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, sentCount: 3 }),
      });

      await api.campaign.send(['1', '2', '3'], 't1');
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/campaign/send`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ contactIds: ['1', '2', '3'], templateId: 't1' }),
        })
      );
    });
  });
});
