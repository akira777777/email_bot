import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignSender } from './CampaignSender';
import { mockContacts, mockTemplates } from '@/test/mocks';

describe('CampaignSender', () => {
  const defaultProps = {
    contacts: mockContacts,
    selectedContacts: [] as string[],
    templates: mockTemplates,
    selectedTemplate: null as string | null,
    onSendCampaign: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render campaign sender card', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Запуск кампании')).toBeInTheDocument();
    });

    it('should show recipients section', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Получатели')).toBeInTheDocument();
    });

    it('should show template section', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Шаблон')).toBeInTheDocument();
    });

    it('should show send button', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /запустить рассылку/i })).toBeInTheDocument();
    });
  });

  describe('validation states', () => {
    it('should show warning when no contacts selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText(/выберите хотя бы одного контакта/i)).toBeInTheDocument();
    });

    it('should show warning when no template selected', () => {
      render(<CampaignSender {...defaultProps} selectedContacts={['1']} />);
      
      expect(screen.getByText(/выберите шаблон/i)).toBeInTheDocument();
    });

    it('should disable send button when no contacts selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      const sendButton = screen.getByRole('button', { name: /запустить рассылку/i });
      expect(sendButton).toBeDisabled();
    });

    it('should disable send button when no template selected', () => {
      render(<CampaignSender {...defaultProps} selectedContacts={['1']} />);
      
      const sendButton = screen.getByRole('button', { name: /запустить рассылку/i });
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
      
      const sendButton = screen.getByRole('button', { name: /запустить рассылку/i });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('recipient display', () => {
    it('should show zero when no contacts selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should show selected contacts count', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
        />
      );
      
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('template display', () => {
    it('should show "Не выбран" when no template selected', () => {
      render(<CampaignSender {...defaultProps} />);
      
      expect(screen.getByText('Не выбран')).toBeInTheDocument();
    });

    it('should show selected template name', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedTemplate="t1" 
        />
      );
      
      expect(screen.getByText('Welcome Template')).toBeInTheDocument();
    });
  });

  describe('preview section', () => {
    it('should show preview when contacts and template selected', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      expect(screen.getByText(/предпросмотр первого письма/i)).toBeInTheDocument();
    });

    it('should not show preview when no contacts selected', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedTemplate="t1" 
        />
      );
      
      expect(screen.queryByText(/предпросмотр первого письма/i)).not.toBeInTheDocument();
    });

    it('should not show preview when no template selected', () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1']} 
        />
      );
      
      expect(screen.queryByText(/предпросмотр первого письма/i)).not.toBeInTheDocument();
    });
  });

  describe('sending campaign', () => {
    it('should call onSendCampaign when button clicked', async () => {
      render(
        <CampaignSender 
          {...defaultProps} 
          selectedContacts={['1', '2']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /запустить рассылку/i }));
      
      await waitFor(() => {
        expect(defaultProps.onSendCampaign).toHaveBeenCalledWith(['1', '2'], 't1');
      });
    });

    it('should show loading state while sending', async () => {
      // Make the promise pending
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      const onSendCampaign = vi.fn().mockReturnValue(pendingPromise);
      
      render(
        <CampaignSender 
          {...defaultProps} 
          onSendCampaign={onSendCampaign}
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      await userEvent.click(screen.getByRole('button', { name: /запустить рассылку/i }));
      
      expect(screen.getByText(/отправка/i)).toBeInTheDocument();
      
      // Cleanup
      resolvePromise!();
    });

    it('should disable button while sending', async () => {
      let resolvePromise: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      const onSendCampaign = vi.fn().mockReturnValue(pendingPromise);
      
      render(
        <CampaignSender 
          {...defaultProps} 
          onSendCampaign={onSendCampaign}
          selectedContacts={['1']} 
          selectedTemplate="t1" 
        />
      );
      
      const button = screen.getByRole('button', { name: /запустить рассылку/i });
      await userEvent.click(button);
      
      // Button should be disabled during sending
      expect(screen.getByRole('button')).toBeDisabled();
      
      // Cleanup
      resolvePromise!();
    });
  });
});
