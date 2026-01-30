import { useState } from "react";
import { Contact, EmailTemplate, EmailStats } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContactsList } from "@/components/contacts/ContactsList";
import { EmailTemplates } from "@/components/templates/EmailTemplates";
import { CampaignSender } from "@/components/campaign/CampaignSender";
import { Toaster } from "@/components/ui/toaster";
import { 
  Users, 
  Send, 
  MailOpen, 
  MessageSquare, 
  Mail,
  Zap
} from "lucide-react";

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Demo data
const initialContacts: Contact[] = [
  {
    id: generateId(),
    companyName: "ТехСтарт",
    email: "info@techstart.ru",
    contactPerson: "Алексей Петров",
    phone: "+7 (999) 123-45-67",
    status: "replied",
    lastContacted: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: generateId(),
    companyName: "МедиаГрупп",
    email: "hello@mediagroup.com",
    contactPerson: "Мария Сидорова",
    status: "opened",
    lastContacted: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 604800000),
  },
  {
    id: generateId(),
    companyName: "ИнноваСофт",
    email: "contact@innovasoft.ru",
    contactPerson: "Дмитрий Козлов",
    status: "sent",
    lastContacted: new Date(Date.now() - 259200000),
    createdAt: new Date(Date.now() - 432000000),
  },
];

const initialTemplates: EmailTemplate[] = [
  {
    id: generateId(),
    name: "Первое знакомство",
    subject: "Предложение о сотрудничестве для {{company}}",
    body: `Здравствуйте, {{contact}}!

Меня зовут [Ваше имя], и я представляю компанию [Название компании]. 

Мы специализируемся на разработке современных веб-приложений и мобильных решений. Изучив деятельность {{company}}, я уверен, что наши услуги могут быть вам полезны.

Предлагаю назначить короткий звонок, чтобы обсудить возможное сотрудничество.

С уважением,
[Ваше имя]
[Контактные данные]`,
    createdAt: new Date(Date.now() - 604800000),
  },
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Calculate stats
  const stats: EmailStats = {
    totalContacts: contacts.length,
    emailsSent: contacts.filter((c) => c.status !== "new").length,
    emailsOpened: contacts.filter((c) => ["opened", "replied"].includes(c.status)).length,
    replies: contacts.filter((c) => c.status === "replied").length,
    bounced: contacts.filter((c) => c.status === "bounced").length,
  };

  // Contact handlers
  const handleAddContact = (contact: Omit<Contact, "id" | "createdAt" | "status">) => {
    const newContact: Contact = {
      ...contact,
      id: generateId(),
      status: "new",
      createdAt: new Date(),
    };
    setContacts([...contacts, newContact]);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    setSelectedContacts(selectedContacts.filter((cId) => cId !== id));
  };

  const handleImportContacts = (importedContacts: Omit<Contact, "id" | "createdAt" | "status">[]) => {
    const newContacts: Contact[] = importedContacts.map((c) => ({
      ...c,
      id: generateId(),
      status: "new" as const,
      createdAt: new Date(),
    }));
    setContacts([...contacts, ...newContacts]);
  };

  const handleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  // Template handlers
  const handleAddTemplate = (template: Omit<EmailTemplate, "id" | "createdAt">) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: generateId(),
      createdAt: new Date(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleEditTemplate = (id: string, template: Omit<EmailTemplate, "id" | "createdAt">) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, ...template } : t
      )
    );
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    if (selectedTemplate === id) {
      setSelectedTemplate(null);
    }
  };

  // Campaign handler
  const handleSendCampaign = (contactIds: string[], templateId: string) => {
    setContacts(
      contacts.map((c) =>
        contactIds.includes(c.id)
          ? { ...c, status: "sent" as const, lastContacted: new Date() }
          : c
      )
    );
    setSelectedContacts([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Email Bot</h1>
              <p className="text-sm text-muted-foreground">Автоматическая рассылка для бизнеса</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">
              <Mail className="h-4 w-4 mr-2" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="h-4 w-4 mr-2" />
              Контакты
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Send className="h-4 w-4 mr-2" />
              Рассылка
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Всего контактов"
                value={stats.totalContacts}
                icon={Users}
                colorClass="bg-primary"
              />
              <StatCard
                title="Писем отправлено"
                value={stats.emailsSent}
                icon={Send}
                trend={{ value: 12, isPositive: true }}
                colorClass="bg-info"
              />
              <StatCard
                title="Прочитано"
                value={stats.emailsOpened}
                icon={MailOpen}
                trend={{ value: 8, isPositive: true }}
                colorClass="bg-warning"
              />
              <StatCard
                title="Ответов получено"
                value={stats.replies}
                icon={MessageSquare}
                trend={{ value: 25, isPositive: true }}
                colorClass="bg-success"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RecentActivity contacts={contacts} />
              </div>
              <div>
                <CampaignSender
                  contacts={contacts}
                  selectedContacts={selectedContacts}
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSendCampaign={handleSendCampaign}
                />
              </div>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <ContactsList
              contacts={contacts}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
              onImportContacts={handleImportContacts}
              selectedContacts={selectedContacts}
              onSelectContact={handleSelectContact}
              onSelectAll={handleSelectAllContacts}
            />
          </TabsContent>

          {/* Templates & Campaign Tab */}
          <TabsContent value="templates" className="space-y-6">
            <EmailTemplates
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ContactsList
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onDeleteContact={handleDeleteContact}
                  onImportContacts={handleImportContacts}
                  selectedContacts={selectedContacts}
                  onSelectContact={handleSelectContact}
                  onSelectAll={handleSelectAllContacts}
                />
              </div>
              <div>
                <CampaignSender
                  contacts={contacts}
                  selectedContacts={selectedContacts}
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSendCampaign={handleSendCampaign}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
