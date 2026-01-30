import { useState, useEffect, useCallback, memo } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Check, X, RefreshCw, Loader2, SendHorizontal, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const MessageBubble = memo(({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  const isDraft = message.role === 'draft';
  
  return (
    <div className={cn('flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300', isUser ? 'justify-start' : 'justify-end')}>
      <div className={cn(
        'max-w-[85%] p-4 rounded-2xl text-sm shadow-sm transition-all',
        isUser 
          ? 'bg-muted border border-border rounded-bl-none' 
          : isDraft 
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 rounded-br-none'
            : 'bg-primary text-primary-foreground rounded-br-none'
      )}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {isUser ? (message.contactPerson || 'Клиент') : 'Помощник'}
          </span>
          <span className="text-[10px] opacity-40">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export function Inbox() {
  const [drafts, setDrafts] = useState<Message[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { toast } = useToast();

  const fetchDrafts = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const data = await api.inbox.getDrafts();
      setDrafts(data as Message[]);
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить черновики', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDrafts();
    const interval = setInterval(() => fetchDrafts(true), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchDrafts]);

  useEffect(() => {
    if (selectedDraft) {
      setEditedContent(selectedDraft.content);
      setIsHistoryLoading(true);
      api.inbox.getHistory(selectedDraft.contactId)
        .then((data) => setHistory(data as Message[]))
        .finally(() => setIsHistoryLoading(false));
    } else {
      setEditedContent('');
      setHistory([]);
    }
  }, [selectedDraft]);

  const handleApprove = async () => {
    if (!selectedDraft) return;
    try {
      // Optimistic state
      const draftId = selectedDraft.id;
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      setSelectedDraft(null);
      
      await api.inbox.approveDraft(draftId, editedContent);
      toast({ title: 'Отправлено', description: 'Ответ успешно доставлен клиенту' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось отправить ответ', variant: 'destructive' });
      fetchDrafts(); // Rollback
    }
  };

  const handleReject = async () => {
    if (!selectedDraft) return;
    try {
      const draftId = selectedDraft.id;
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      setSelectedDraft(null);
      
      await api.inbox.rejectDraft(draftId);
      toast({ title: 'Черновик удален' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Не удалось удалить черновик', variant: 'destructive' });
      fetchDrafts();
    }
  };

  const handleSimulateReply = async () => {
     if (!selectedDraft || isSimulating) return;

     setIsSimulating(true);
     try {
         await api.inbox.simulateIncoming(selectedDraft.contactId, "Это тестовый ответ от клиента. Подскажите стоимость услуг?");
         toast({ title: 'Симуляция...', description: 'Клиент отправил сообщение. Генерируем новый черновик...' });
         
         // Poll for the new draft
         let attempts = 0;
         const check = setInterval(async () => {
           const newData = await api.inbox.getDrafts() as Message[];
           if (newData.length > drafts.length || attempts > 5) {
             setDrafts(newData);
             setIsSimulating(false);
             clearInterval(check);
           }
           attempts++;
         }, 2000);
     } catch (e) {
         console.error(e);
         setIsSimulating(false);
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px] animate-in fade-in duration-500">
      {/* Drafts Sidebar */}
      <Card className="lg:col-span-4 flex flex-col border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Ожидают проверки
              <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-1">
                {drafts.length}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => fetchDrafts()} disabled={isLoading} className="h-8 w-8">
               <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1 divide-y divide-border/20">
          {isLoading && drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xs">Загрузка...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3 px-8 text-center">
              <div className="p-4 rounded-full bg-muted/50">
                <Check className="h-6 w-6 opacity-30" />
              </div>
              <p className="text-sm">Все входящие обработаны!</p>
            </div>
          ) : (
            drafts.map(draft => (
              <div
                key={draft.id}
                className={cn(
                  'p-4 cursor-pointer hover:bg-muted/30 transition-all border-l-4',
                  selectedDraft?.id === draft.id ? 'bg-primary/5 border-primary shadow-inner' : 'border-transparent'
                )}
                onClick={() => setSelectedDraft(draft)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm truncate pr-2">
                    {draft.contactPerson || draft.companyName}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {draft.content}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Main Conversation Area */}
      <Card className="lg:col-span-8 flex flex-col border-border/50 shadow-xl overflow-hidden relative">
        {selectedDraft ? (
          <>
            <CardHeader className="border-b border-border/30 bg-background/50 backdrop-blur-sm z-10 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {(selectedDraft.contactPerson || selectedDraft.companyName)?.[0]}
                </div>
                <div>
                  <CardTitle className="text-base">
                    {selectedDraft.contactPerson || selectedDraft.companyName}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {selectedDraft.companyName}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-2 bg-muted/5 scroll-smooth">
              {isHistoryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-8">
                    <span className="text-[10px] px-3 py-1 bg-muted rounded-full text-muted-foreground font-medium">
                      Начало переписки
                    </span>
                  </div>
                  {history.filter(m => m.id !== selectedDraft.id).map(m => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                  
                  {/* Current Draft Area */}
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                      <Zap className="h-4 w-4 fill-current" />
                      <span className="text-xs font-bold uppercase tracking-wider">ИИ предложил ответ</span>
                    </div>
                    <div className="relative group">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[180px] p-4 bg-amber-500/5 border-amber-500/20 focus-visible:ring-amber-500/30 rounded-2xl resize-none text-sm leading-relaxed"
                        placeholder="Отредактируйте ответ здесь..."
                      />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title="AI перегенерация (в планах)">
                            <RefreshCw className="h-3.5 w-3.5" />
                         </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/30 p-4 bg-muted/20 flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                 <Button 
                    variant="ghost" 
                    onClick={handleSimulateReply} 
                    disabled={isSimulating}
                    size="sm"
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-all"
                 >
                   {isSimulating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
                   Симуляция ответа клиента
                 </Button>
               </div>
               <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleReject} className="flex-1 sm:flex-none border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl">
                    <X className="mr-2 h-4 w-4" /> Отклонить
                  </Button>
                  <Button onClick={handleApprove} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-6">
                    <SendHorizontal className="mr-2 h-4 w-4" /> Отправить
                  </Button>
               </div>
            </CardFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-6 p-12 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-full animate-pulse" />
              <MessageCircle className="h-16 w-16 opacity-10 text-primary relative" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="font-bold text-foreground opacity-50">Выберите диалог</h3>
              <p className="text-sm leading-relaxed opacity-40">Нажмите на сообщение в левой колонке, чтобы проверить предложенный ИИ ответ.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
