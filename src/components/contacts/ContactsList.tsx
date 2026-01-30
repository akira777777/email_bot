import { useState, useRef, useMemo, useCallback, memo } from "react";
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Trash2, Search, Mail, ChevronLeft, ChevronRight } from "lucide-react";
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
  sent: { label: "Отправлено", className: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
  opened: { label: "Прочитано", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  replied: { label: "Ответил", className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  bounced: { label: "Ошибка", className: "bg-destructive/10 text-destructive border border-destructive/20" },
};

// Memoized individual row for performance
const ContactRow = memo(({ 
  contact, 
  isSelected, 
  onSelect, 
  onDelete 
}: { 
  contact: Contact, 
  isSelected: boolean, 
  onSelect: (id: string) => void, 
  onDelete: (id: string) => void 
}) => (
  <tr className={cn(
      "border-b border-border/50 hover:bg-muted/30 transition-colors",
      isSelected && "bg-primary/5"
    )}
  >
    <td className="p-4">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(contact.id)}
        className="rounded border-border accent-primary cursor-pointer"
      />
    </td>
    <td className="p-4">
      <div className="font-medium">{contact.companyName}</div>
      {contact.phone && (
        <div className="text-xs text-muted-foreground">{contact.phone}</div>
      )}
    </td>
    <td className="p-4">
      <div className="flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm truncate max-w-[200px]">{contact.email}</span>
      </div>
    </td>
    <td className="p-4 hidden md:table-cell">
      <span className="text-sm">{contact.contactPerson || "—"}</span>
    </td>
    <td className="p-4">
      <span className={cn(
          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
          statusConfig[contact.status].className
        )}
      >
        {statusConfig[contact.status].label}
      </span>
    </td>
    <td className="p-4 text-right">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(contact.id)}
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </td>
  </tr>
));

ContactRow.displayName = "ContactRow";

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [newContact, setNewContact] = useState({
    companyName: "",
    email: "",
    contactPerson: "",
    phone: "",
    notes: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimized filtering
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.companyName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.contactPerson?.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  const handleAddContact = useCallback(() => {
    if (!newContact.companyName || !newContact.email) {
      toast({ title: "Ошибка", description: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    
    onAddContact(newContact);
    setNewContact({ companyName: "", email: "", contactPerson: "", phone: "", notes: "" });
    setIsAddOpen(false);
    toast({ title: "Контакт добавлен", description: `${newContact.companyName} успешно добавлен` });
  }, [newContact, onAddContact]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported = results.data
          .map(row => ({
            email: row.email || row.Email || row.EMAIL || row["E-mail"],
            companyName: row.companyName || row.company || row.Company || row["Компания"] || row["Название"],
            contactPerson: row.contactPerson || row.contact || row["Контакт"] || row["Имя"],
            phone: row.phone || row.Phone || row["Телефон"],
            notes: row.notes || row.Notes || row["Заметки"],
          }))
          .filter(c => c.email && c.companyName) as Omit<Contact, "id" | "createdAt" | "status">[];

        if (imported.length > 0) {
          onImportContacts(imported);
          toast({ title: "Импорт завершён", description: `Добавлено ${imported.length} контактов` });
        } else {
          toast({ title: "Ошибка импорта", description: "Некорректный формат файла", variant: "destructive" });
        }
      },
      error: () => toast({ title: "Ошибка", description: "Не удалось прочитать файл", variant: "destructive" }),
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, email или имени..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-card/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv,.txt" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none">
            <Upload className="h-4 w-4 mr-2" />
            Импорт CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Новый контакт</DialogTitle>
                <DialogDescription>Добавьте данные компании для рассылки</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Компания *</Label>
                  <Input id="companyName" value={newContact.companyName} onChange={e => setNewContact({...newContact, companyName: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Контактное лицо</Label>
                  <Input id="contactPerson" value={newContact.contactPerson} onChange={e => setNewContact({...newContact, contactPerson: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Отмена</Button>
                <Button onClick={handleAddContact}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onChange={onSelectAll}
                    className="rounded border-border accent-primary cursor-pointer"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Компания</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Email</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider hidden md:table-cell">Контакт</th>
                <th className="p-4 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Статус</th>
                <th className="p-4 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    {searchQuery ? "По вашему запросу ничего не найдено" : "Список пуст"}
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContacts.includes(contact.id)}
                    onSelect={onSelectContact}
                    onDelete={onDeleteContact}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border/30">
            <div className="text-xs text-muted-foreground">
              Показано {Math.min(filteredContacts.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredContacts.length, currentPage * ITEMS_PER_PAGE)} из {filteredContacts.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium px-2">
                Стр {currentPage} из {totalPages}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedContacts.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-card border border-primary/20 shadow-2xl shadow-primary/20 rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 z-[100]">
          <span className="text-sm font-medium">
            Выбрано: <span className="text-primary font-bold">{selectedContacts.length}</span>
          </span>
          <div className="h-4 w-[1px] bg-border mx-2" />
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-8 px-3">
            Сбросить
          </Button>
        </div>
      )}
    </div>
  );
}
