import { useState, useMemo } from "react";
import { Contact, EmailTemplate } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Users, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignSenderProps {
  contacts: Contact[];
  selectedContacts: string[];
  templates: EmailTemplate[];
  selectedTemplate: string | null;
  onSendCampaign: (contactIds: string[], templateId: string) => Promise<void>;
}

export function CampaignSender({
  contacts,
  selectedContacts,
  templates,
  selectedTemplate,
  onSendCampaign,
}: CampaignSenderProps) {
  const [isSending, setIsSending] = useState(false);

  const selectedTemplateData = useMemo(() => 
    templates.find(t => t.id === selectedTemplate),
    [templates, selectedTemplate]
  );

  const targetContacts = useMemo(() => {
    const selectedSet = new Set(selectedContacts);
    return contacts.filter(c => selectedSet.has(c.id));
  }, [contacts, selectedContacts]);

  const handleSend = async () => {
    if (selectedContacts.length === 0 || !selectedTemplate || isSending) return;
    
    setIsSending(true);
    try {
      await onSendCampaign(selectedContacts, selectedTemplate);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = selectedContacts.length > 0 && !!selectedTemplate && !isSending;

  return (
    <Card className="border-primary/20 shadow-xl shadow-primary/5 overflow-hidden animate-in fade-in duration-700 h-full">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Запуск кампании
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Selection Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Получатели</span>
            </div>
            <div className="text-2xl font-bold">{selectedContacts.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Шаблон</span>
            </div>
            <div className="text-sm font-bold truncate">
              {selectedTemplateData ? selectedTemplateData.name : "Не выбран"}
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        <div className="space-y-2">
          {!selectedTemplate && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
              <AlertCircle className="h-3.5 w-3.5" />
              Выберите шаблон во вкладке "Рассылка"
            </div>
          )}
          {selectedContacts.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50">
              <AlertCircle className="h-3.5 w-3.5" />
              Выберите хотя бы одного контакта
            </div>
          )}
        </div>

        {/* Preview Info */}
        {selectedTemplateData && selectedContacts.length > 0 && (
          <div className="p-4 rounded-2xl border border-primary/10 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Предпросмотр первого письма
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                Кому: <span className="font-normal opacity-70">{targetContacts[0]?.email}</span>
              </p>
              <p className="text-xs font-bold text-foreground">
                Тема: <span className="font-normal opacity-70">
                  {selectedTemplateData.subject.replace('{{company}}', targetContacts[0]?.companyName || '')}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 border-t border-border/50 p-6 mt-auto">
        <Button 
          onClick={handleSend} 
          disabled={!canSend}
          className={cn(
            "w-full h-12 rounded-xl font-bold transition-all duration-300",
            canSend ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : "opacity-50"
          )}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Запустить рассылку
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
