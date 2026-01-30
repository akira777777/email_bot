import { useState, useCallback, useEffect } from "react";
import { Contact } from "@/types";
import { api } from "@/lib/api";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.contacts.getAll();
      setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(async (contact: Omit<Contact, "id" | "createdAt" | "status">) => {
    await api.contacts.create(contact);
    fetchContacts();
  }, [fetchContacts]);

  const deleteContact = useCallback(async (id: string) => {
    await api.contacts.delete(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContacts((prev) => prev.filter((cId) => cId !== id));
  }, []);

  const importContacts = useCallback(async (importedContacts: Omit<Contact, "id" | "createdAt" | "status">[]) => {
    try {
      setIsLoading(true);
      await api.contacts.bulkCreate(importedContacts);
      await fetchContacts();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [fetchContacts]);

  const selectContact = useCallback((id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  }, []);

  const selectAllContacts = useCallback(() => {
    setContacts((currentContacts) => {
      setSelectedContacts((currentSelected) => {
        if (currentSelected.length === currentContacts.length) {
          return [];
        } else {
          return currentContacts.map((c) => c.id);
        }
      });
      return currentContacts;
    });
  }, []);

  return {
    contacts,
    setContacts,
    selectedContacts,
    setSelectedContacts,
    addContact,
    deleteContact,
    importContacts,
    selectContact,
    selectAllContacts,
    refreshContacts: fetchContacts,
    isLoading
  };
}
