import { useMemo, useEffect, Suspense, lazy } from "react";
import { EmailStats } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Toaster } from "@/components/ui/toaster";
import { 
  Users, 
  Send, 
  MailOpen, 
  MessageSquare, 
  Mail,
  Zap,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/useAppStore";

// Lazy loading components for code-splitting
const ContactsList = lazy(() => import("@/components/contacts/ContactsList").then(m => ({ default: m.ContactsList })));
const EmailTemplates = lazy(() => import("@/components/templates/EmailTemplates").then(m => ({ default: m.EmailTemplates })));
const CampaignSender = lazy(() => import("@/components/campaign/CampaignSender").then(m => ({ default: m.CampaignSender })));
const Inbox = lazy(() => import("@/components/inbox/Inbox").then(m => ({ default: m.Inbox })));

export default function App() {
  const { toast } = useToast();
  
  const {
    contacts,
    templates,
    selectedContacts,
    selectedTemplate,
    fetchContacts,
    fetchTemplates,
    setSelectedContacts,
    setSelectedTemplate,
    addContact,
    deleteContact,
    importContacts,
    addTemplate,
    editTemplate,
    deleteTemplate
  } = useAppStore();

  useEffect(() => {
    fetchContacts();
    fetchTemplates();
  }, [fetchContacts, fetchTemplates]);

  // Calculate stats
  const stats: EmailStats = useMemo(() => {
    const safeContacts = Array.isArray(contacts) ? contacts : [];
    return {
      totalContacts: safeContacts.length,
      emailsSent: safeContacts.filter((c) => c.status !== "new").length,
      emailsOpened: safeContacts.filter((c) => ["opened", "replied"].includes(c.status)).length,
      replies: safeContacts.filter((c) => c.status === "replied").length,
      bounced: safeContacts.filter((c) => c.status === "bounced").length,
    };
  }, [contacts]);

  // Campaign handler
  const handleSendCampaign = async (contactIds: string[]) => {
    if (!selectedTemplate) {
      toast({
        title: "Ошибка",
        description: "Выберите шаблон для рассылки",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.campaign.send(contactIds, selectedTemplate);
      await fetchContacts();
      setSelectedContacts([]);
      toast({
        title: "Успех",
        description: `Рассылка отправлена ${contactIds.length} контактам`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить рассылку",
        variant: "destructive",
      });
    }
  };

  const selectContact = (id: string) => {
    setSelectedContacts(
      selectedContacts.includes(id) 
        ? selectedContacts.filter(cId => cId !== id) 
        : [...selectedContacts, id]
    );
  };

  const selectAllContacts = () => {
    const safeContacts = Array.isArray(contacts) ? contacts : [];
    if (selectedContacts.length === safeContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(safeContacts.map(c => c.id));
    }
  };

  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text tracking-tight">Email Bot</h1>
              <p className="text-sm text-muted-foreground font-medium">Автоматическая рассылка для бизнеса</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 p-1 h-12">
              <TabsTrigger value="dashboard" className="data-[state=active]:shadow-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Обзор</span>
              </TabsTrigger>
              <TabsTrigger value="inbox" className="data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Входящие</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:shadow-sm">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Контакты</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:shadow-sm">
                <Send className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Рассылка</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <Suspense fallback={<LoadingFallback />}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  colorClass="bg-blue-500"
                />
                <StatCard
                  title="Прочитано"
                  value={stats.emailsOpened}
                  icon={MailOpen}
                  trend={{ value: 8, isPositive: true }}
                  colorClass="bg-amber-500"
                />
                <StatCard
                  title="Ответов получено"
                  value={stats.replies}
                  icon={MessageSquare}
                  trend={{ value: 25, isPositive: true }}
                  colorClass="bg-emerald-500"
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <RecentActivity contacts={contacts} />
                </div>
                <div className="space-y-6">
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

            {/* Inbox Tab */}
            <TabsContent value="inbox" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Inbox />
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <TabsContent value="templates" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <EmailTemplates
                templates={templates}
                onAddTemplate={addTemplate}
                onEditTemplate={editTemplate}
                onDeleteTemplate={deleteTemplate}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />

              <div className="grid gap-8 lg:grid-cols-3">
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
                <div className="space-y-6">
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
          </Suspense>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
