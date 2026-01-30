import { Contact, EmailTemplate } from "@/types";

const API_URL = 'http://localhost:3001/api';

export const api = {
  contacts: {
    getAll: () => fetch(`${API_URL}/contacts`).then(res => res.json()),
    create: (data: Partial<Contact>) => fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  },
  templates: {
    getAll: () => fetch(`${API_URL}/templates`).then(res => res.json()),
    create: (data: Partial<EmailTemplate>) => fetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: Partial<EmailTemplate>) => fetch(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_URL}/templates/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  },
  inbox: {
    getDrafts: () => fetch(`${API_URL}/inbox/drafts`).then(res => res.json()),
    getHistory: (contactId: string) => fetch(`${API_URL}/inbox/messages/${contactId}`).then(res => res.json()),
    simulateIncoming: (contactId: string, content: string) => fetch(`${API_URL}/inbox/simulate-incoming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, content })
    }).then(res => res.json()),
    approveDraft: (id: string) => fetch(`${API_URL}/inbox/drafts/${id}/approve`, {
      method: 'POST'
    }).then(res => res.json()),
    rejectDraft: (id: string) => fetch(`${API_URL}/inbox/drafts/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  },
  campaign: {
    send: (contactIds: string[], templateId: string) => fetch(`${API_URL}/campaign/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds, templateId })
    }).then(res => res.json())
  }
};
