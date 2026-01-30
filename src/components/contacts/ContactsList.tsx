import { useState, useRef } from "react";
import { Contact } from "@/types";
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
import { Plus, Upload, Trash2, Search, Mail, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface ContactsListProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, "id" | "createdAt" | "status">) => void;
  onDeleteContact: (id: string) => void;
  onImportContacts: (contacts: Omit<Contact, "id" | "createdAt" | "status">[]) => void;
  selectedContacts: string[];
  onSelectContact: (id: string) => void;
  onSelectAll: () => void;
}

const statusConfig = {
  new: { label: "Новый", className: "bg-muted text-muted-foreground" },
  sent: { label: "Отправлено", className: "bg-info/20 text-info" },
  opened: { label: "Прочитано", className: "bg-warning/20 text-warning" },
  replied: { label: "Ответил", className: "bg-success/20 text-success" },
  bounced: { label: "Ошибка", className: "bg-destructive/20 text-destructive" },
};

export function ContactsList({
  contacts,
  onAddContact,
  onDeleteContact,
  onImportContacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
}: ContactsListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newContact, setNewContact] = useState({
    companyName: "",
    email: "",
    contactPerson: "",
    phone: "",
    notes: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddContact = () => {
    if (!newContact.companyName || !newContact.email) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive",
      });
      return;
    }
    
    onAddContact(newContact);
    setNewContact({
      companyName: "",
      email: "",
      contactPerson: "",
      phone: "",
      notes: "",
    });
    setIsAddOpen(false);
    toast({
      title: "Контакт добавлен",
      description: `${newContact.companyName} успешно добавлен в список`,
      variant: "success",
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedContacts: Omit<Contact, "id" | "createdAt" | "status">[] = [];
        
        results.data.forEach((row: Record<string, string>) => {
          const email = row.email || row.Email || row.EMAIL || row["E-mail"];
          const companyName = row.companyName || row.company || row.Company || row["Компания"] || row["Название"];
          
          if (email && companyName) {
            importedContacts.push({
              email,
              companyName,
              contactPerson: row.contactPerson || row.contact || row["Контакт"] || row["Имя"],
              phone: row.phone || row.Phone || row["Телефон"],
              notes: row.notes || row.Notes || row["Заметки"],
            });
          }
        });

        if (importedContacts.length > 0) {
          onImportContacts(importedContacts);
          toast({
            title: "Импорт завершён",
            description: `Добавлено ${importedContacts.length} контактов`,
            variant: "success",
          });
        } else {
          toast({
            title: "Ошибка импорта",
            description: "Не найдены контакты с email и названием компании",
            variant: "destructive",
          });
        }
      },
      error: () => {
        toast({
          title: "Ошибка",
          description: "Не удалось прочитать файл",
          variant: "destructive",
        });
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск контактов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv,.txt"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Импорт CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Добавить контакт
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый контакт</DialogTitle>
                <DialogDescription>
                  Добавьте информацию о компании для рассылки
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Название компании *</Label>
                  <Input
                    id="companyName"
                    value={newContact.companyName}
                    onChange={(e) =>
                      setNewContact({ ...newContact, companyName: e.target.value })
                    }
                    placeholder="ООО Компания"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    placeholder="info@company.ru"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Контактное лицо</Label>
                  <Input
                    id="contactPerson"
                    value={newContact.contactPerson}
                    onChange={(e) =>
                      setNewContact({ ...newContact, contactPerson: e.target.value })
                    }
                    placeholder="Иван Иванов"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Заметки</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) =>
                      setNewContact({ ...newContact, notes: e.target.value })
                    }
                    placeholder="Дополнительная информация..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddContact}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="p-4 text-left font-medium text-muted-foreground">Компания</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Email</th>
                <th className="p-4 text-left font-medium text-muted-foreground hidden md:table-cell">Контакт</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Статус</th>
                <th className="p-4 text-left font-medium text-muted-foreground w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? "Контакты не найдены" : "Добавьте первый контакт для начала работы"}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-muted/30 transition-colors",
                      selectedContacts.includes(contact.id) && "bg-primary/5"
                    )}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => onSelectContact(contact.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{contact.companyName}</div>
                      {contact.phone && (
                        <div className="text-sm text-muted-foreground">{contact.phone}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm">{contact.contactPerson || "—"}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          statusConfig[contact.status].className
                        )}
                      >
                        {statusConfig[contact.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteContact(contact.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-xl animate-fade-up">
          <span className="text-sm text-muted-foreground">
            Выбрано: <span className="font-medium text-foreground">{selectedContacts.length}</span> контактов
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelectAll()}>
              Снять выделение
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
