import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from './Inbox';
import { mockDrafts, mockMessages } from '@/test/mocks';

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    inbox: {
      getDrafts: vi.fn(),
      getHistory: vi.fn(),
      simulateIncoming: vi.fn(),
      approveDraft: vi.fn(),
      rejectDraft: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

import { api } from '@/lib/api';

describe('Inbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.inbox.getDrafts).mockResolvedValue([]);
  });

  describe('rendering', () => {
    it('should render inbox header', async () => {
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText(/входящие/i)).toBeInTheDocument();
      });
    });

    it('should show empty state when no drafts', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue([]);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText(/нет новых черновиков/i)).toBeInTheDocument();
      });
    });

    it('should fetch drafts on mount', async () => {
      render(<Inbox />);
      
      await waitFor(() => {
        expect(api.inbox.getDrafts).toHaveBeenCalled();
      });
    });

    it('should display drafts list', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should show draft content preview', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText(/draft response content/i)).toBeInTheDocument();
      });
    });
  });

  describe('draft selection', () => {
    it('should show detail view when draft selected', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByText(/переписка с/i)).toBeInTheDocument();
      });
    });

    it('should fetch history when draft selected', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(api.inbox.getHistory).toHaveBeenCalledWith('1');
      });
    });

    it('should show placeholder when no draft selected', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText(/выберите диалог/i)).toBeInTheDocument();
      });
    });
  });

  describe('draft editing', () => {
    it('should show editable textarea with draft content', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('Draft response content');
      });
    });

    it('should allow editing draft content', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Edited content');
      
      expect(textarea).toHaveValue('Edited content');
    });
  });

  describe('approve draft', () => {
    it('should show approve button', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /утвердить/i })).toBeInTheDocument();
      });
    });

    it('should call approveDraft when approved', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      vi.mocked(api.inbox.approveDraft).mockResolvedValue({ id: 'd1', status: 'sent' });
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /утвердить/i })).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByRole('button', { name: /утвердить/i }));
      
      await waitFor(() => {
        expect(api.inbox.approveDraft).toHaveBeenCalledWith('d1', 'Draft response content');
      });
    });
  });

  describe('reject draft', () => {
    it('should show reject button', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /отклонить/i })).toBeInTheDocument();
      });
    });

    it('should call rejectDraft when rejected', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      vi.mocked(api.inbox.rejectDraft).mockResolvedValue({ success: true });
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /отклонить/i })).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByRole('button', { name: /отклонить/i }));
      
      await waitFor(() => {
        expect(api.inbox.rejectDraft).toHaveBeenCalledWith('d1');
      });
    });
  });

  describe('refresh', () => {
    it('should show refresh button', async () => {
      render(<Inbox />);
      
      await waitFor(() => {
        const refreshButton = document.querySelector('.lucide-refresh-cw');
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('should refresh drafts on button click', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue([]);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(api.inbox.getDrafts).toHaveBeenCalledTimes(1);
      });
      
      const refreshButton = document.querySelector('.lucide-refresh-cw')?.closest('button');
      if (refreshButton) {
        await userEvent.click(refreshButton);
        
        await waitFor(() => {
          expect(api.inbox.getDrafts).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  describe('simulate incoming', () => {
    it('should show simulate button when draft selected', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /simulate/i })).toBeInTheDocument();
      });
    });
  });

  describe('message history', () => {
    it('should display conversation history', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByText('Hello, I need help')).toBeInTheDocument();
      });
    });

    it('should differentiate user and assistant messages', async () => {
      vi.mocked(api.inbox.getDrafts).mockResolvedValue(mockDrafts);
      vi.mocked(api.inbox.getHistory).mockResolvedValue(mockMessages);
      
      render(<Inbox />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByText('John Doe'));
      
      await waitFor(() => {
        expect(screen.getByText('user')).toBeInTheDocument();
      });
    });
  });
});
