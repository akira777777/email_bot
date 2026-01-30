import { useState, useCallback, memo } from "react";
import { EmailTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, FileText, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface EmailTemplatesProps {
  templates: EmailTemplate[];
  onAddTemplate: (template: Omit<EmailTemplate, "id" | "createdAt">) => void;
  onEditTemplate: (id: string, template: Omit<EmailTemplate, "id" | "createdAt">) => void;
  onDeleteTemplate: (id: string) => void;
  selectedTemplate: string | null;
  onSelectTemplate: (id: string | null) => void;
}

const TemplateCard = memo(({ 
  template, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onCopy 
}: { 
  template: EmailTemplate, 
  isSelected: boolean, 
  onSelect: () => void, 
  onEdit: () => void, 
  onDelete: () => void, 
  onCopy: () => void 
}) => (
  <div
    className={cn(
      "glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 group border border-border/50 shadow-sm",
      isSelected ? "ring-2 ring-primary bg-primary/5 shadow-primary/10 border-primary/20" : "hover:shadow-md hover:border-border"
    )}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:bg-primary/20"
        )}>
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-tight">{template.name}</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Шаблон</p>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Тема</Label>
        <p className="text-xs font-semibold line-clamp-1">{template.subject}</p>
      </div>
      <div>
        <Label className="text-[10px] uppercase text-muted-foreground font-bold mb-1 block">Контент</Label>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
          "{template.body}"
        </p>
      </div>
    </div>

    <Button
      variant="ghost"
      size="sm"
      className="mt-5 w-full bg-muted/30 hover:bg-muted text-[10px] uppercase font-bold tracking-widest h-8"
      onClick={(e) => {
        e.stopPropagation();
        onCopy();
      }}
    >
      <Copy className="h-3.5 w-3.5 mr-2" />
      Копировать
    </Button>
  </div>
));

TemplateCard.displayName = "TemplateCard";

export function EmailTemplates({
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  selectedTemplate,
  onSelectTemplate,
}: EmailTemplatesProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
  });

  const handleAdd = useCallback(() => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля шаблона",
        variant: "destructive",
      });
      return;
    }
    
    onAddTemplate(formData);
    setFormData({ name: "", subject: "", body: "" });
    setIsAddOpen(false);
    toast({
      title: "Шаблон создан",
      description: `Шаблон "${formData.name}" успешно создан`,
      variant: "success",
    });
  }, [formData, onAddTemplate]);

  const handleEdit = useCallback(() => {
    if (!editingId || !formData.name || !formData.subject || !formData.body) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля шаблона",
        variant: "destructive",
      });
      return;
    }
    
    onEditTemplate(editingId, formData);
    setFormData({ name: "", subject: "", body: "" });
    setEditingId(null);
    setIsEditOpen(false);
    toast({
      title: "Шаблон обновлён",
      description: "Изменения сохранены",
      variant: "success",
    });
  }, [editingId, formData, onEditTemplate]);

  const openEditDialog = useCallback((template: EmailTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setIsEditOpen(true);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена",
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Шаблоны писем</h3>
          <p className="text-sm text-muted-foreground">
            Используйте переменные: {"{{company}}"}, {"{{contact}}"}, {"{{email}}"}
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4 mr-2" />
              Новый шаблон
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Создать шаблон</DialogTitle>
              <DialogDescription>
                Создайте шаблон письма для массовой рассылки
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название шаблона</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Первое знакомство"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Тема письма</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Предложение о сотрудничестве для {{company}}"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Текст письма</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Здравствуйте, {{contact}}!

Меня зовут [Ваше имя], и я хотел бы предложить вам сотрудничество...

С уважением,
[Подпись]"
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAdd}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <div className="col-span-full glass-card rounded-xl p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Создайте первый шаблон письма для начала рассылки
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => onSelectTemplate(selectedTemplate === template.id ? null : template.id)}
              onEdit={() => openEditDialog(template)}
              onDelete={() => onDeleteTemplate(template.id)}
              onCopy={() => copyToClipboard(template.body)}
            />
          ))
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать шаблон</DialogTitle>
            <DialogDescription>
              Внесите изменения в шаблон письма
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Название шаблона</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-subject">Тема письма</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-body">Текст письма</Label>
              <Textarea
                id="edit-body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
