import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByText('Email Bot')).toBeInTheDocument();
    expect(screen.getByText('Автоматическая рассылка для бизнеса')).toBeInTheDocument();
  });

  it('renders dashboard stats', () => {
    render(<App />);
    expect(screen.getByText('Всего контактов')).toBeInTheDocument();
    expect(screen.getByText('Писем отправлено')).toBeInTheDocument();
  });
});
