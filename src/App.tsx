import { useMemo } from "react";
import { EmailStats } from "@/types";
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
import { useContacts } from "@/hooks/useContacts";
import { useTemplates } from "@/hooks/useTemplates";

export default function App() {
  const {
    contacts,
    setContacts,
    selectedContacts,
    setSelectedContacts,
    addContact,
    deleteContact,
    importContacts,
    selectContact,
    selectAllContacts,
  } = useContacts();

  const {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    addTemplate,
    editTemplate,
    deleteTemplate,
  } = useTemplates();

  // Calculate stats
  const stats: EmailStats = useMemo(() => ({
    totalContacts: contacts.length,
    emailsSent: contacts.filter((c) => c.status !== "new").length,
    emailsOpened: contacts.filter((c) => ["opened", "replied"].includes(c.status)).length,
    replies: contacts.filter((c) => c.status === "replied").length,
    bounced: contacts.filter((c) => c.status === "bounced").length,
  }), [contacts]);

  // Campaign handler
  const handleSendCampaign = (contactIds: string[]) => {
    setContacts((prev) =>
      prev.map((c) =>
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
              onAddContact={addContact}
              onDeleteContact={deleteContact}
              onImportContacts={importContacts}
              selectedContacts={selectedContacts}
              onSelectContact={selectContact}
              onSelectAll={selectAllContacts}
            />
          </TabsContent>

          {/* Templates & Campaign Tab */}
          <TabsContent value="templates" className="space-y-6">
            <EmailTemplates
              templates={templates}
              onAddTemplate={addTemplate}
              onEditTemplate={editTemplate}
              onDeleteTemplate={deleteTemplate}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ContactsList
                  contacts={contacts}
                  onAddContact={addContact}
                  onDeleteContact={deleteContact}
                  onImportContacts={importContacts}
                  selectedContacts={selectedContacts}
                  onSelectContact={selectContact}
                  onSelectAll={selectAllContacts}
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
