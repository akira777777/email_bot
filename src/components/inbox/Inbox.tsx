import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Check, X, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  contactId: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'draft';
  status: string;
  createdAt: string;
  companyName?: string;
  contactPerson?: string;
}

export function Inbox() {
  const [drafts, setDrafts] = useState<Message[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Message | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const { toast } = useToast();

  const fetchDrafts = async () => {
    try {
      const data = await api.inbox.getDrafts();
      setDrafts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  useEffect(() => {
    if (selectedDraft) {
      api.inbox.getHistory(selectedDraft.contactId).then(setHistory);
    }
  }, [selectedDraft]);

  const handleApprove = async () => {
    if (!selectedDraft) return;
    try {
      await api.inbox.approveDraft(selectedDraft.id);
      toast({ title: 'Ответ отправлен', description: 'Сообщение успешно отправлено клиенту.' });
      fetchDrafts();
      setSelectedDraft(null);
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось отправить ответ.', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedDraft) return;
    try {
      await api.inbox.rejectDraft(selectedDraft.id);
      toast({ title: 'Черновик удален' });
      fetchDrafts();
      setSelectedDraft(null);
    } catch (e) {
        console.error(e);
        toast({ title: 'Ошибка', description: 'Не удалось удалить черновик.', variant: 'destructive' });
    }
  };

  // Simulation for testing
  const handleSimulateReply = async () => {
     if (!selectedDraft) return;

     try {
         await api.inbox.simulateIncoming(selectedDraft.contactId, "Это тестовый ответ от клиента. Подскажите стоимость услуг?");
         toast({ title: 'Симуляция ответа...', description: 'Ожидаем генерацию черновика (3 сек)...' });
         // Wait a bit for AI to generate draft
         setTimeout(fetchDrafts, 3000);
     } catch (e) {
         console.error(e);
     }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Drafts List */}
      <Card className="col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Входящие (Drafts)
            <Button variant="ghost" size="icon" onClick={fetchDrafts} className="ml-auto">
               <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto flex-1">
          {drafts.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">Нет новых черновиков</div>
          ) : (
            drafts.map(draft => (
              <div
                key={draft.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${selectedDraft?.id === draft.id ? 'bg-accent border-primary' : ''}`}
                onClick={() => setSelectedDraft(draft)}
              >
                <div className="font-semibold">{draft.contactPerson || draft.companyName}</div>
                <div className="text-sm text-muted-foreground truncate">{draft.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(draft.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Review Area */}
      <Card className="col-span-2 flex flex-col">
        {selectedDraft ? (
          <>
            <CardHeader>
              <CardTitle>
                Переписка с {selectedDraft.contactPerson || selectedDraft.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {/* History */}
              <div className="space-y-4 mb-6">
                 {history.filter(m => m.id !== selectedDraft.id).map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                       <div className={`max-w-[80%] p-3 rounded-lg ${
                         m.role === 'user'
                           ? 'bg-muted'
                           : m.role === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900 border border-yellow-500'
                           : 'bg-primary text-primary-foreground'
                       }`}>
                          <div className="text-xs opacity-70 mb-1 capitalize">{m.role}</div>
                          {m.content}
                       </div>
                    </div>
                 ))}
              </div>

              {/* Current Draft */}
              <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900 animate-in fade-in slide-in-from-bottom-4">
                 <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">Предложенный ответ (AI)</h4>
                 <Textarea
                    value={selectedDraft.content}
                    className="min-h-[150px] bg-transparent border-none focus-visible:ring-0 resize-none"
                    readOnly
                 />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
               <div className="flex gap-2">
                 <Button variant="outline" onClick={handleSimulateReply} size="sm">
                   Simulate Client Reply
                 </Button>
               </div>
               <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject}>
                    <X className="mr-2 h-4 w-4" /> Отклонить
                  </Button>
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" /> Утвердить и отправить
                  </Button>
               </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <MessageCircle className="h-12 w-12 opacity-20" />
            <p>Выберите диалог для просмотра</p>
          </div>
        )}
      </Card>
    </div>
  );
}
