import { Contact } from "@/types";
import { cn } from "@/lib/utils";
import { Mail, MailOpen, MessageSquare, AlertTriangle, Clock } from "lucide-react";

interface RecentActivityProps {
  contacts: Contact[];
}

const statusConfig = {
  new: { icon: Clock, label: "Новый", color: "text-muted-foreground" },
  sent: { icon: Mail, label: "Отправлено", color: "text-info" },
  opened: { icon: MailOpen, label: "Прочитано", color: "text-warning" },
  replied: { icon: MessageSquare, label: "Ответил", color: "text-success" },
  bounced: { icon: AlertTriangle, label: "Ошибка", color: "text-destructive" },
};

export function RecentActivity({ contacts }: RecentActivityProps) {
  const recentContacts = contacts
    .filter(c => c.status !== 'new')
    .sort((a, b) => {
      const dateA = a.lastContacted?.getTime() || 0;
      const dateB = b.lastContacted?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  if (recentContacts.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4">Последняя активность</h3>
        <p className="text-muted-foreground text-sm text-center py-8">
          Пока нет активности. Начните рассылку!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4">Последняя активность</h3>
      <div className="space-y-4">
        {recentContacts.map((contact) => {
          const config = statusConfig[contact.status];
          const Icon = config.icon;
          
          return (
            <div 
              key={contact.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className={cn("p-2 rounded-lg bg-background", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{contact.companyName}</p>
                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
              </div>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full bg-background", config.color)}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
