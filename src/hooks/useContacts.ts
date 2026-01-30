import { useState, useCallback } from "react";
import { Contact } from "@/types";
import { generateId } from "@/lib/utils";
import { initialContacts } from "@/data/demo-data";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const addContact = useCallback((contact: Omit<Contact, "id" | "createdAt" | "status">) => {
    const newContact: Contact = {
      ...contact,
      id: generateId(),
      status: "new",
      createdAt: new Date(),
    };
    setContacts((prev) => [...prev, newContact]);
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContacts((prev) => prev.filter((cId) => cId !== id));
  }, []);

  const importContacts = useCallback((importedContacts: Omit<Contact, "id" | "createdAt" | "status">[]) => {
    const newContacts = importedContacts.map((c) => ({
      ...c,
      id: generateId(),
      status: "new" as const,
      createdAt: new Date(),
    }));
    setContacts((prev) => [...prev, ...newContacts]);
  }, []);

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
    setContacts, // Exposed for external updates if needed (e.g. campaign send)
    selectedContacts,
    setSelectedContacts,
    addContact,
    deleteContact,
    importContacts,
    selectContact,
    selectAllContacts,
  };
}
