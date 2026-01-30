import { useState, useCallback, useEffect } from "react";
import { EmailTemplate } from "@/types";
import { api } from "@/lib/api";

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await api.templates.getAll();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = useCallback(async (template: Omit<EmailTemplate, "id" | "createdAt">) => {
    await api.templates.create(template);
    fetchTemplates();
  }, [fetchTemplates]);

  const editTemplate = useCallback(async (id: string, template: Partial<Omit<EmailTemplate, "id" | "createdAt">>) => {
    await api.templates.update(id, template);
    fetchTemplates();
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    await api.templates.delete(id);
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
