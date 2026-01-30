import { useState, useCallback } from "react";
import { EmailTemplate } from "@/types";
import { generateId } from "@/lib/utils";
import { initialTemplates } from "@/data/demo-data";

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const addTemplate = useCallback((template: Omit<EmailTemplate, "id" | "createdAt">) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  }, []);

  const editTemplate = useCallback((id: string, template: Partial<Omit<EmailTemplate, "id" | "createdAt">>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...template } : t))
    );
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setSelectedTemplate((prev) => (prev === id ? null : prev));
  }, []);

  return {
    templates,
    setTemplates,
    selectedTemplate,
    setSelectedTemplate,
    addTemplate,
    editTemplate,
    deleteTemplate,
  };
}
