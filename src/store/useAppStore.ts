import { create } from 'zustand';
import { Contact, EmailTemplate } from '@/types';
import { api } from '@/lib/api';

interface AppState {
  contacts: Contact[];
  templates: EmailTemplate[];
  selectedContacts: string[];
  selectedTemplate: string | null;
  isLoadingContacts: boolean;
  isLoadingTemplates: boolean;

  // Actions
  fetchContacts: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  
  setSelectedContacts: (ids: string[]) => void;
  setSelectedTemplate: (id: string | null) => void;
  
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  importContacts: (contacts: Omit<Contact, 'id' | 'createdAt' | 'status'>[]) => Promise<void>;
  
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => Promise<void>;
  editTemplate: (id: string, template: Omit<EmailTemplate, 'id' | 'createdAt'>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  contacts: [],
  templates: [],
  selectedContacts: [],
  selectedTemplate: null,
  isLoadingContacts: false,
  isLoadingTemplates: false,

  fetchContacts: async () => {
    set({ isLoadingContacts: true });
    try {
      const data = await api.contacts.getAll();
      set({ contacts: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoadingContacts: false });
    }
  },

  fetchTemplates: async () => {
    set({ isLoadingTemplates: true });
    try {
      const data = await api.templates.getAll();
      set({ templates: data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoadingTemplates: false });
    }
  },

  setSelectedContacts: (ids) => set({ selectedContacts: ids }),
  setSelectedTemplate: (id) => set({ selectedTemplate: id }),

  addContact: async (contact) => {
    const data = await api.contacts.create(contact);
    set((state) => ({ contacts: [data, ...state.contacts] }));
  },

  deleteContact: async (id) => {
    // Optimistic update
    const previousContacts = get().contacts;
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
      selectedContacts: state.selectedContacts.filter((sid) => sid !== id),
    }));
    
    try {
      await api.contacts.delete(id);
    } catch (e) {
      set({ contacts: previousContacts });
      throw e;
    }
  },

  importContacts: async (contacts) => {
    set({ isLoadingContacts: true });
    try {
      await api.contacts.bulkCreate(contacts);
      const data = await api.contacts.getAll();
      set({ contacts: Array.isArray(data) ? data : [] });
    } finally {
      set({ isLoadingContacts: false });
    }
  },

  addTemplate: async (template) => {
    const data = await api.templates.create(template);
    set((state) => ({ templates: [data, ...state.templates] }));
  },

  editTemplate: async (id, template) => {
    const data = await api.templates.update(id, template);
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? data : t)),
    }));
  },

  deleteTemplate: async (id) => {
    await api.templates.delete(id);
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      selectedTemplate: state.selectedTemplate === id ? null : state.selectedTemplate,
    }));
  },
}));
