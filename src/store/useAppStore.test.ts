import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import { mockContacts, mockTemplates } from '@/test/mocks';
import { Contact } from '@/types';

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    contacts: {
      getAll: vi.fn(),
      create: vi.fn(),
      bulkCreate: vi.fn(),
      delete: vi.fn(),
    },
    templates: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { api } from '@/lib/api';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      contacts: [],
      templates: [],
      selectedContacts: [],
      selectedTemplate: null,
      isLoadingContacts: false,
      isLoadingTemplates: false,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      const state = useAppStore.getState();
      expect(state.contacts).toEqual([]);
      expect(state.templates).toEqual([]);
      expect(state.selectedContacts).toEqual([]);
      expect(state.selectedTemplate).toBeNull();
      expect(state.isLoadingContacts).toBe(false);
      expect(state.isLoadingTemplates).toBe(false);
    });
  });

  describe('fetchContacts', () => {
    it('should fetch and set contacts', async () => {
      vi.mocked(api.contacts.getAll).mockResolvedValue(mockContacts);

      await useAppStore.getState().fetchContacts();

      const state = useAppStore.getState();
      expect(state.contacts).toEqual(mockContacts);
      expect(state.isLoadingContacts).toBe(false);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: Contact[]) => void;
      vi.mocked(api.contacts.getAll).mockImplementation(
        () => new Promise<Contact[]>((resolve) => { resolvePromise = resolve; })
      );

      const fetchPromise = useAppStore.getState().fetchContacts();
      expect(useAppStore.getState().isLoadingContacts).toBe(true);

      resolvePromise!(mockContacts);
      await fetchPromise;

      expect(useAppStore.getState().isLoadingContacts).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.contacts.getAll).mockRejectedValue(new Error('Network error'));

      await useAppStore.getState().fetchContacts();

      expect(useAppStore.getState().contacts).toEqual([]);
      expect(useAppStore.getState().isLoadingContacts).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('fetchTemplates', () => {
    it('should fetch and set templates', async () => {
      vi.mocked(api.templates.getAll).mockResolvedValue(mockTemplates);

      await useAppStore.getState().fetchTemplates();

      expect(useAppStore.getState().templates).toEqual(mockTemplates);
    });

    it('should handle fetch errors gracefully', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.templates.getAll).mockRejectedValue(new Error('Error'));

      await useAppStore.getState().fetchTemplates();

      expect(useAppStore.getState().templates).toEqual([]);
    });
  });

  describe('setSelectedContacts', () => {
    it('should set selected contacts', () => {
      useAppStore.getState().setSelectedContacts(['1', '2']);
      expect(useAppStore.getState().selectedContacts).toEqual(['1', '2']);
    });

    it('should clear selection with empty array', () => {
      useAppStore.setState({ selectedContacts: ['1', '2'] });
      useAppStore.getState().setSelectedContacts([]);
      expect(useAppStore.getState().selectedContacts).toEqual([]);
    });
  });

  describe('setSelectedTemplate', () => {
    it('should set selected template', () => {
      useAppStore.getState().setSelectedTemplate('t1');
      expect(useAppStore.getState().selectedTemplate).toBe('t1');
    });

    it('should clear selection with null', () => {
      useAppStore.setState({ selectedTemplate: 't1' });
      useAppStore.getState().setSelectedTemplate(null);
      expect(useAppStore.getState().selectedTemplate).toBeNull();
    });
  });

  describe('addContact', () => {
    it('should add a new contact to the beginning', async () => {
      useAppStore.setState({ contacts: mockContacts });
      const newContact = { companyName: 'New Co', email: 'new@test.com' };
      const createdContact = { id: '4', ...newContact, status: 'new' as const, createdAt: new Date() };
      
      vi.mocked(api.contacts.create).mockResolvedValue(createdContact);

      await useAppStore.getState().addContact(newContact);

      const state = useAppStore.getState();
      expect(state.contacts[0]).toEqual(createdContact);
      expect(state.contacts).toHaveLength(mockContacts.length + 1);
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact optimistically', async () => {
      useAppStore.setState({ 
        contacts: mockContacts,
        selectedContacts: ['1', '2'] 
      });
      vi.mocked(api.contacts.delete).mockResolvedValue({ success: true });

      await useAppStore.getState().deleteContact('1');

      const state = useAppStore.getState();
      expect(state.contacts.find(c => c.id === '1')).toBeUndefined();
      expect(state.selectedContacts).not.toContain('1');
    });

    it('should rollback on delete failure', async () => {
      useAppStore.setState({ contacts: mockContacts });
      vi.mocked(api.contacts.delete).mockRejectedValue(new Error('Delete failed'));

      await expect(useAppStore.getState().deleteContact('1')).rejects.toThrow();

      // Should rollback to original state
      expect(useAppStore.getState().contacts).toEqual(mockContacts);
    });
  });

  describe('importContacts', () => {
    it('should import contacts and refresh list', async () => {
      const importData = [{ companyName: 'Import Co', email: 'import@test.com' }];
      const updatedContacts = [...mockContacts, { id: '4', ...importData[0], status: 'new' as const, createdAt: new Date() }];
      
      vi.mocked(api.contacts.bulkCreate).mockResolvedValue([]);
      vi.mocked(api.contacts.getAll).mockResolvedValue(updatedContacts);

      await useAppStore.getState().importContacts(importData);

      expect(api.contacts.bulkCreate).toHaveBeenCalledWith(importData);
      expect(useAppStore.getState().contacts).toEqual(updatedContacts);
    });

    it('should set loading state during import', async () => {
      vi.mocked(api.contacts.bulkCreate).mockResolvedValue([]);
      vi.mocked(api.contacts.getAll).mockResolvedValue([]);

      const importPromise = useAppStore.getState().importContacts([]);
      expect(useAppStore.getState().isLoadingContacts).toBe(true);

      await importPromise;
      expect(useAppStore.getState().isLoadingContacts).toBe(false);
    });
  });

  describe('addTemplate', () => {
    it('should add a new template to the beginning', async () => {
      useAppStore.setState({ templates: mockTemplates });
      const newTemplate = { name: 'New', subject: 'Subject', body: 'Body' };
      const createdTemplate = { id: 't3', ...newTemplate, createdAt: new Date() };
      
      vi.mocked(api.templates.create).mockResolvedValue(createdTemplate);

      await useAppStore.getState().addTemplate(newTemplate);

      expect(useAppStore.getState().templates[0]).toEqual(createdTemplate);
    });
  });

  describe('editTemplate', () => {
    it('should update an existing template', async () => {
      useAppStore.setState({ templates: mockTemplates });
      const updatedTemplate = { ...mockTemplates[0], name: 'Updated Name' };
      
      vi.mocked(api.templates.update).mockResolvedValue(updatedTemplate);

      await useAppStore.getState().editTemplate('t1', { name: 'Updated Name', subject: mockTemplates[0].subject, body: mockTemplates[0].body });

      const template = useAppStore.getState().templates.find(t => t.id === 't1');
      expect(template?.name).toBe('Updated Name');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template and clear selection if needed', async () => {
      useAppStore.setState({ 
        templates: mockTemplates,
        selectedTemplate: 't1' 
      });
      vi.mocked(api.templates.delete).mockResolvedValue({ success: true });

      await useAppStore.getState().deleteTemplate('t1');

      const state = useAppStore.getState();
      expect(state.templates.find(t => t.id === 't1')).toBeUndefined();
      expect(state.selectedTemplate).toBeNull();
    });

    it('should keep selection if different template deleted', async () => {
      useAppStore.setState({ 
        templates: mockTemplates,
        selectedTemplate: 't1' 
      });
      vi.mocked(api.templates.delete).mockResolvedValue({ success: true });

      await useAppStore.getState().deleteTemplate('t2');

      expect(useAppStore.getState().selectedTemplate).toBe('t1');
    });
  });
});
