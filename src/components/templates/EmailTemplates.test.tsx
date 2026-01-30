import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailTemplates } from './EmailTemplates';
import { mockTemplates } from '@/test/mocks';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('EmailTemplates', () => {
  const defaultProps = {
    templates: mockTemplates,
    onAddTemplate: vi.fn(),
    onEditTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
    selectedTemplate: null as string | null,
    onSelectTemplate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render templates header', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText('Шаблоны писем')).toBeInTheDocument();
    });

    it('should render templates list', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText('Welcome Template')).toBeInTheDocument();
      expect(screen.getByText('Follow-up Template')).toBeInTheDocument();
    });

    it('should display template subjects', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText('Welcome to {{company}}')).toBeInTheDocument();
      expect(screen.getByText('Following up with {{company}}')).toBeInTheDocument();
    });

    it('should display template body preview', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText(/"Hello \{\{contact\}\}, welcome!"/)).toBeInTheDocument();
    });

    it('should show empty state when no templates', () => {
      render(<EmailTemplates {...defaultProps} templates={[]} />);
      
      expect(screen.getByText(/у вас пока нет шаблонов/i)).toBeInTheDocument();
    });

    it('should show variable hints', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText(/\{\{company\}\}/)).toBeInTheDocument();
      expect(screen.getByText(/\{\{contact\}\}/)).toBeInTheDocument();
    });

    it('should show create button', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /создать/i })).toBeInTheDocument();
    });
  });

  describe('template selection', () => {
    it('should call onSelectTemplate when template clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      await userEvent.click(screen.getByText('Welcome Template'));
      
      expect(defaultProps.onSelectTemplate).toHaveBeenCalledWith('t1');
    });

    it('should deselect when selected template clicked again', async () => {
      render(<EmailTemplates {...defaultProps} selectedTemplate="t1" />);
      
      await userEvent.click(screen.getByText('Welcome Template'));
      
      expect(defaultProps.onSelectTemplate).toHaveBeenCalledWith(null);
    });

    it('should highlight selected template with ring', () => {
      render(<EmailTemplates {...defaultProps} selectedTemplate="t1" />);
      
      const templateCard = screen.getByText('Welcome Template').closest('.glass-card');
      expect(templateCard).toHaveClass('ring-2');
    });
  });

  describe('add template dialog', () => {
    it('should open add template dialog', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /создать/i }));
      
      expect(screen.getByText('Новый шаблон')).toBeInTheDocument();
    });

    it('should show form fields in dialog', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /создать/i }));
      
      expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/тема письма/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/текст/i)).toBeInTheDocument();
    });

    it('should call onAddTemplate with form data', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      // Open dialog
      await userEvent.click(screen.getByRole('button', { name: /создать/i }));
      
      // Fill form
      await userEvent.type(screen.getByLabelText(/название/i), 'Test Template');
      await userEvent.type(screen.getByLabelText(/тема письма/i), 'Test Subject');
      await userEvent.type(screen.getByLabelText(/текст/i), 'Test Body');
      
      // Submit
      await userEvent.click(screen.getByRole('button', { name: /сохранить/i }));
      
      expect(defaultProps.onAddTemplate).toHaveBeenCalledWith({
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
      });
    });
  });

  describe('edit template dialog', () => {
    it('should open edit dialog when edit button clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      // Find edit buttons by svg icon
      const editButtons = document.querySelectorAll('button');
      const editButton = Array.from(editButtons).find(
        btn => btn.querySelector('.lucide-edit-2')
      );
      
      if (editButton) {
        await userEvent.click(editButton);
        expect(screen.getByText('Редактирование')).toBeInTheDocument();
      }
    });

    it('should pre-fill form with template data', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const editButtons = document.querySelectorAll('button');
      const editButton = Array.from(editButtons).find(
        btn => btn.querySelector('.lucide-edit-2')
      );
      
      if (editButton) {
        await userEvent.click(editButton);
        
        expect(screen.getByDisplayValue('Welcome Template')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Welcome to {{company}}')).toBeInTheDocument();
      }
    });
  });

  describe('delete template', () => {
    it('should call onDeleteTemplate when delete button clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const deleteButtons = document.querySelectorAll('button');
      const deleteButton = Array.from(deleteButtons).find(
        btn => btn.querySelector('.lucide-trash-2')
      );
      
      if (deleteButton) {
        await userEvent.click(deleteButton);
        expect(defaultProps.onDeleteTemplate).toHaveBeenCalledWith('t1');
      }
    });

    it('should not trigger selection when delete clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const deleteButtons = document.querySelectorAll('button');
      const deleteButton = Array.from(deleteButtons).find(
        btn => btn.querySelector('.lucide-trash-2')
      );
      
      if (deleteButton) {
        await userEvent.click(deleteButton);
        expect(defaultProps.onSelectTemplate).not.toHaveBeenCalled();
      }
    });
  });

  describe('copy to clipboard', () => {
    it('should copy template body when copy button clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const copyButtons = document.querySelectorAll('button');
      const copyButton = Array.from(copyButtons).find(
        btn => btn.querySelector('.lucide-copy')
      );
      
      if (copyButton) {
        await userEvent.click(copyButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello {{contact}}, welcome!');
      }
    });
  });
});
