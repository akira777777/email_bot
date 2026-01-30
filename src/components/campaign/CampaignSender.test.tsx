import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignSender } from './CampaignSender';
import { mockContacts, mockTemplates } from '@/test/mocks';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('CampaignSender', () => {
  const defaultProps = {
    contacts: mockContacts,
    selectedContacts: [] as string[],
    templates: mockTemplates,
    selectedTemplate: null as string | null,
    onSendCampaign: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render campaign sender card', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Запуск рассылки')).toBeInTheDocument();
    });

    it('should show recipients section', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Получатели')).toBeInTheDocument();
    });

    it('should show template section', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Шаблон письма')).toBeInTheDocument();
    });

    it('should show send button', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /отправить/i })).toBeInTheDocument();
    });
  });

  describe('validation states', () => {
    it('should show warning when no contacts selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText(/выберите хотя бы один контакт/i)).toBeInTheDocument();
    });

    it('should show warning when no template selected', () => {
      render(<CampaignSender {...defaultProps} selectedContacts={['1']} />);
      
      expect(screen.getByText(/выберите шаблон/i)).toBeInTheDocument();
    });

    it('should disable send button when invalid', () => {
      render(<CampaignSender {...defaultProps} />);
      
      const sendButton = screen.getByRole('button', { name: /отправить/i });
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when valid', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      const sendButton = screen.getByRole('button', { name: /отправить/i });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('recipient display', () => {
    it('should show selected contacts count', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
        />
      );
      
      expect(screen.getByText(/выбрано 2 контактов/i)).toBeInTheDocument();
    });

    it('should show new contacts count', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
        />
      );
      
      expect(screen.getByText(/1 новых/i)).toBeInTheDocument();
    });

    it('should show check icon when contacts selected', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
        />
      );
      
      const checkIcons = screen.getAllByRole('img', { hidden: true });
      // There should be check icons visible
      expect(document.querySelector('.lucide-check-circle-2')).toBeInTheDocument();
    });
  });

  describe('template display', () => {
    it('should show selected template name', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedTemplate="t1" 
        />
      );
      
      expect(screen.getByText('Welcome Template')).toBeInTheDocument();
    });

    it('should show prompt to select template when none selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText(/выберите шаблон письма/i)).toBeInTheDocument();
    });
  });

  describe('send confirmation dialog', () => {
    it('should open confirmation dialog on send click', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      expect(screen.getByText('Подтверждение рассылки')).toBeInTheDocument();
    });

    it('should show recipient count in dialog', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show email preview', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      expect(screen.getByText(/предпросмотр письма/i)).toBeInTheDocument();
    });

    it('should show email preview with substituted variables', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      // Should replace {{company}} with actual company name
      expect(screen.getByText(/Welcome to Test Company/)).toBeInTheDocument();
    });
  });

  describe('sending campaign', () => {
    it('should call onSendCampaign when confirmed', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
          selectedTemplate="t1" 
        />
      );
      
      // Open dialog
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      // Find and click the confirm send button in dialog
      const dialogButtons = screen.getAllByRole('button', { name: /отправить/i });
      const confirmButton = dialogButtons[dialogButtons.length - 1];
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendCampaign).toHaveBeenCalledWith(['1', '2']);
      });
    });

    it('should show loading state while sending', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      const dialogButtons = screen.getAllByRole('button', { name: /отправить/i });
      const confirmButton = dialogButtons[dialogButtons.length - 1];
      await userEvent.click(confirmButton);
      
      expect(screen.getByText(/отправка/i)).toBeInTheDocument();
    });

    it('should close dialog after cancel', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      await userEvent.click(screen.getByRole('button', { name: /отмена/i }));
      
      await waitFor(() => {
        expect(screen.queryByText('Подтверждение рассылки')).not.toBeInTheDocument();
      });
    });
  });

  describe('preview recipient selection', () => {
    it('should allow selecting different recipients for preview', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /отправить/i }));
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });
});
