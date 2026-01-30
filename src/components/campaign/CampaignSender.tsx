import { useState, useMemo } from "react";
import { Contact, EmailTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Mail, Users, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CampaignSenderProps {
  contacts: Contact[];
  selectedContacts: string[];
  templates: EmailTemplate[];
  selectedTemplate: string | null;
  onSendCampaign: (contactIds: string[], templateId: string) => void;
}

export function CampaignSender({
  contacts,
  selectedContacts,
  templates,
  selectedTemplate,
  onSendCampaign,
}: CampaignSenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewContact, setPreviewContact] = useState<Contact | null>(null);

  const template = templates.find((t) => t.id === selectedTemplate);

  const selectedContactsList = useMemo(() => {
    const selectedSet = new Set(selectedContacts);
    return contacts.filter((c) => selectedSet.has(c.id));
  }, [contacts, selectedContacts]);

  const newContacts = useMemo(() => {
    return selectedContactsList.filter((c) => c.status === "new");
  }, [selectedContactsList]);

  const canSend = selectedContacts.length > 0 && selectedTemplate && template;

  const getPreviewText = (text: string, contact: Contact) => {
    return text
      .replace(/\{\{company\}\}/g, contact.companyName)
      .replace(/\{\{contact\}\}/g, contact.contactPerson || "Уважаемый клиент")
      .replace(/\{\{email\}\}/g, contact.email);
  };

  const handleSend = async () => {
    if (!canSend || !template) return;

    setIsSending(true);
    
    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    onSendCampaign(selectedContacts, selectedTemplate);
    
    setIsSending(false);
    setIsOpen(false);
    
    toast({
      title: "Рассылка запущена",
      description: `Отправлено ${selectedContacts.length} писем`,
      variant: "success",
    });
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
          <Send className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Запуск рассылки</h3>
          <p className="text-sm text-muted-foreground">
            Отправьте письма выбранным контактам
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <Users className={cn(
            "h-5 w-5",
            selectedContacts.length > 0 ? "text-success" : "text-muted-foreground"
          )} />
          <div className="flex-1">
            <p className="text-sm font-medium">Получатели</p>
            <p className="text-sm text-muted-foreground">
              {selectedContacts.length > 0
                ? `Выбрано ${selectedContacts.length} контактов (${newContacts.length} новых)`
                : "Выберите контакты из списка"}
            </p>
          </div>
          {selectedContacts.length > 0 && (
            <CheckCircle2 className="h-5 w-5 text-success" />
          )}
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
          <FileText className={cn(
            "h-5 w-5",
            template ? "text-success" : "text-muted-foreground"
          )} />
          <div className="flex-1">
            <p className="text-sm font-medium">Шаблон письма</p>
            <p className="text-sm text-muted-foreground">
              {template ? template.name : "Выберите шаблон письма"}
            </p>
          </div>
          {template && <CheckCircle2 className="h-5 w-5 text-success" />}
        </div>

        {!canSend && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              {!selectedContacts.length
                ? "Выберите хотя бы один контакт"
                : "Выберите шаблон письма"}
            </p>
          </div>
        )}

        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={!canSend}
          onClick={() => setIsOpen(true)}
        >
          <Mail className="h-5 w-5 mr-2" />
          Отправить {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ""}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Подтверждение рассылки</DialogTitle>
            <DialogDescription>
              Проверьте параметры перед отправкой
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Получатели</p>
                <p className="text-2xl font-bold">{selectedContacts.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Шаблон</p>
                <p className="font-medium truncate">{template?.name}</p>
              </div>
            </div>

            {template && selectedContactsList.length > 0 && (
              <div className="space-y-2">
                <Label>Предпросмотр письма</Label>
                <div className="p-4 rounded-lg border bg-background space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Кому:</p>
                    <select 
                      className="w-full text-sm bg-transparent border-none p-0 focus:outline-none"
                      onChange={(e) => {
                        const contact = selectedContactsList.find(c => c.id === e.target.value);
                        setPreviewContact(contact || null);
                      }}
                    >
                      {selectedContactsList.slice(0, 10).map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.email} ({contact.companyName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Тема:</p>
                    <p className="font-medium">
                      {getPreviewText(template.subject, previewContact || selectedContactsList[0])}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Текст:</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {getPreviewText(template.body, previewContact || selectedContactsList[0])}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-info/10 text-info">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Для реальной отправки подключите email-сервис (SendGrid, Mailgun или Resend)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
              Отмена
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
