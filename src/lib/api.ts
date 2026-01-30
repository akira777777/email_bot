import { Contact, EmailTemplate } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const message = data.error?.message || data.error || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data.error?.code);
  }
  
  return data as T;
}

export const api = {
  contacts: {
    getAll: () => request<Contact[]>(`${API_URL}/contacts`),
    create: (data: Partial<Contact>) => request<Contact>(`${API_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    bulkCreate: (data: Partial<Contact>[]) => request<Contact[]>(`${API_URL}/contacts/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<{ success: boolean }>(`${API_URL}/contacts/${id}`, {
      method: 'DELETE'
    }),
  },
  templates: {
    getAll: () => request<EmailTemplate[]>(`${API_URL}/templates`),
    create: (data: Partial<EmailTemplate>) => request<EmailTemplate>(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    update: (id: string, data: Partial<EmailTemplate>) => request<EmailTemplate>(`${API_URL}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<{ success: boolean }>(`${API_URL}/templates/${id}`, {
      method: 'DELETE'
    }),
  },
  inbox: {
    getDrafts: () => request<unknown[]>(`${API_URL}/inbox/drafts`),
    getHistory: (contactId: string) => request<unknown[]>(`${API_URL}/inbox/messages/${contactId}`),
    simulateIncoming: (contactId: string, content: string) => request<unknown>(`${API_URL}/inbox/simulate-incoming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, content })
    }),
    approveDraft: (id: string, content?: string) => request<unknown>(`${API_URL}/inbox/drafts/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: content ? JSON.stringify({ content }) : undefined
    }),
    rejectDraft: (id: string) => request<{ success: boolean }>(`${API_URL}/inbox/drafts/${id}`, {
      method: 'DELETE'
    }),
  },
  campaign: {
    send: (contactIds: string[], templateId: string) => request<unknown>(`${API_URL}/campaign/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactIds, templateId })
    })
  }
};
