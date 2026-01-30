import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { Users, Send } from 'lucide-react';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Contacts',
    value: 150,
    icon: Users,
    colorClass: 'bg-primary',
  };

  describe('rendering', () => {
    it('should render title', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    });

    it('should render numeric value', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should render string value', () => {
      render(<StatCard {...defaultProps} value="N/A" />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<StatCard {...defaultProps} />);
      
      const icon = document.querySelector('.lucide-users');
      expect(icon).toBeInTheDocument();
    });

    it('should apply color class to icon container', () => {
      render(<StatCard {...defaultProps} colorClass="bg-blue-500" />);
      
      const iconContainer = document.querySelector('.bg-blue-500');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('trend display', () => {
    it('should show positive trend', () => {
      render(
        <StatCard 
          {...defaultProps} 
          trend={{ value: 12, isPositive: true }} 
        />
      );
      
      expect(screen.getByText(/↑ 12%/)).toBeInTheDocument();
    });

    it('should show negative trend', () => {
      render(
        <StatCard 
          {...defaultProps} 
          trend={{ value: 5, isPositive: false }} 
        />
      );
      
      expect(screen.getByText(/↓ 5%/)).toBeInTheDocument();
    });

    it('should show comparison text', () => {
      render(
        <StatCard 
          {...defaultProps} 
          trend={{ value: 10, isPositive: true }} 
        />
      );
      
      expect(screen.getByText(/vs прошлая неделя/)).toBeInTheDocument();
    });

    it('should not show trend when not provided', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.queryByText(/↑/)).not.toBeInTheDocument();
      expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
    });

    it('should apply success color for positive trend', () => {
      render(
        <StatCard 
          {...defaultProps} 
          trend={{ value: 10, isPositive: true }} 
        />
      );
      
      const trendText = screen.getByText(/↑ 10%/).closest('p');
      expect(trendText).toHaveClass('text-success');
    });

    it('should apply destructive color for negative trend', () => {
      render(
        <StatCard 
          {...defaultProps} 
          trend={{ value: 10, isPositive: false }} 
        />
      );
      
      const trendText = screen.getByText(/↓ 10%/).closest('p');
      expect(trendText).toHaveClass('text-destructive');
    });
  });

  describe('different icons', () => {
    it('should render Send icon', () => {
      render(<StatCard {...defaultProps} icon={Send} />);
      
      const icon = document.querySelector('.lucide-send');
      expect(icon).toBeInTheDocument();
    });
  });
});
