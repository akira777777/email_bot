import { useState } from "react";
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

  const handleAdd = () => {
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
  };

  const handleEdit = () => {
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
  };

  const openEditDialog = (template: EmailTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setIsEditOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена",
    });
  };

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
            <div
              key={template.id}
              className={cn(
                "glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg",
                selectedTemplate === template.id && "ring-2 ring-primary"
              )}
              onClick={() => onSelectTemplate(
                selectedTemplate === template.id ? null : template.id
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-medium">{template.name}</h4>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(template);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTemplate(template.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {template.subject}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.body}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(template.body);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Копировать текст
              </Button>
            </div>
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
