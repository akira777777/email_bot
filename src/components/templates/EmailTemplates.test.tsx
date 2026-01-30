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
      
      expect(screen.getByText(/Hello \{\{contact\}\}, welcome!/)).toBeInTheDocument();
    });

    it('should show empty state when no templates', () => {
      render(<EmailTemplates {...defaultProps} templates={[]} />);
      
      expect(screen.getByText(/создайте первый шаблон/i)).toBeInTheDocument();
    });

    it('should show variable hints', () => {
      render(<EmailTemplates {...defaultProps} />);
      
      expect(screen.getByText(/\{\{company\}\}/)).toBeInTheDocument();
      expect(screen.getByText(/\{\{contact\}\}/)).toBeInTheDocument();
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

    it('should highlight selected template', () => {
      render(<EmailTemplates {...defaultProps} selectedTemplate="t1" />);
      
      const templateCard = screen.getByText('Welcome Template').closest('.glass-card');
      expect(templateCard).toHaveClass('ring-2');
    });
  });

  describe('add template', () => {
    it('should open add template dialog', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /новый шаблон/i }));
      
      expect(screen.getByText('Создать шаблон')).toBeInTheDocument();
    });

    it('should call onAddTemplate with form data', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      // Open dialog
      await userEvent.click(screen.getByRole('button', { name: /новый шаблон/i }));
      
      // Fill form
      await userEvent.type(screen.getByLabelText(/название шаблона/i), 'Test Template');
      await userEvent.type(screen.getByLabelText(/тема письма/i), 'Test Subject');
      await userEvent.type(screen.getByLabelText(/текст письма/i), 'Test Body');
      
      // Submit
      await userEvent.click(screen.getByRole('button', { name: /создать/i }));
      
      expect(defaultProps.onAddTemplate).toHaveBeenCalledWith({
        name: 'Test Template',
        subject: 'Test Subject',
        body: 'Test Body',
      });
    });

    it('should close dialog after adding', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      await userEvent.click(screen.getByRole('button', { name: /новый шаблон/i }));
      await userEvent.type(screen.getByLabelText(/название/i), 'Test');
      await userEvent.type(screen.getByLabelText(/тема/i), 'Subject');
      await userEvent.type(screen.getByLabelText(/текст/i), 'Body');
      await userEvent.click(screen.getByRole('button', { name: /создать/i }));
      
      await waitFor(() => {
        expect(screen.queryByText('Создать шаблон')).not.toBeInTheDocument();
      });
    });
  });

  describe('edit template', () => {
    it('should open edit dialog when edit button clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-edit-2')
      );
      await userEvent.click(editButtons[0]);
      
      expect(screen.getByText('Редактировать шаблон')).toBeInTheDocument();
    });

    it('should pre-fill form with template data', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const editButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-edit-2')
      );
      await userEvent.click(editButtons[0]);
      
      expect(screen.getByDisplayValue('Welcome Template')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Welcome to {{company}}')).toBeInTheDocument();
    });

    it('should call onEditTemplate with updated data', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      // Open edit dialog
      const editButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-edit-2')
      );
      await userEvent.click(editButtons[0]);
      
      // Clear and update name
      const nameInput = screen.getByDisplayValue('Welcome Template');
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Template');
      
      // Save
      await userEvent.click(screen.getByRole('button', { name: /сохранить/i }));
      
      expect(defaultProps.onEditTemplate).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ name: 'Updated Template' })
      );
    });
  });

  describe('delete template', () => {
    it('should call onDeleteTemplate when delete button clicked', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      );
      await userEvent.click(deleteButtons[0]);
      
      expect(defaultProps.onDeleteTemplate).toHaveBeenCalledWith('t1');
    });

    it('should not propagate click to template selection', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button').filter(
        btn => btn.querySelector('svg.lucide-trash-2')
      );
      await userEvent.click(deleteButtons[0]);
      
      // onSelectTemplate should not be called
      expect(defaultProps.onSelectTemplate).not.toHaveBeenCalled();
    });
  });

  describe('copy to clipboard', () => {
    it('should copy template body to clipboard', async () => {
      render(<EmailTemplates {...defaultProps} />);
      
      const copyButtons = screen.getAllByRole('button', { name: /копировать текст/i });
      await userEvent.click(copyButtons[0]);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello {{contact}}, welcome!');
    });
  });
});
