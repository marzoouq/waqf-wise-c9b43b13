/**
 * Loading Component Tests - Comprehensive Functional Tests
 * اختبارات وظيفية شاملة لمكونات التحميل
 * @version 2.0.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Loading Spinner Component for testing
const LoadingSpinner = ({ 
  size = 'md', 
  text, 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-busy="true">
      <div 
        className={`animate-spin ${sizeClasses[size]} border-primary border-t-transparent rounded-full`}
        data-testid="spinner"
      />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
};

// Full Page Loading Component
const FullPageLoading = ({ message = 'جاري التحميل...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" role="status">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="xl" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  </div>
);

// Skeleton Loading Component
const SkeletonLoader = ({ 
  lines = 3, 
  showAvatar = false 
}: { 
  lines?: number; 
  showAvatar?: boolean;
}) => (
  <div className="animate-pulse space-y-4" data-testid="skeleton">
    {showAvatar && (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      </div>
    )}
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-muted rounded" style={{ width: `${100 - i * 10}%` }} />
    ))}
  </div>
);

// Table Skeleton Component
const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-2" data-testid="table-skeleton">
    <div className="flex gap-4 border-b pb-2">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 py-2">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-4 bg-muted rounded flex-1 animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render a spinner element', () => {
      render(<LoadingSpinner />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should have animate-spin class', () => {
      render(<LoadingSpinner />);
      expect(screen.getByTestId('spinner')).toHaveClass('animate-spin');
    });

    it('should support different sizes', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { container, unmount } = render(<LoadingSpinner size={size} />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        unmount();
      });
    });

    it('should render small size with correct classes', () => {
      render(<LoadingSpinner size="sm" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should render medium size with correct classes', () => {
      render(<LoadingSpinner size="md" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('should render large size with correct classes', () => {
      render(<LoadingSpinner size="lg" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });

    it('should render extra large size with correct classes', () => {
      render(<LoadingSpinner size="xl" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-16', 'w-16');
    });

    it('should render with loading text', () => {
      render(<LoadingSpinner text="جاري التحميل..." />);
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    });

    it('should have accessible status role', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-busy attribute', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('should have screen reader text', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('FullPageLoading', () => {
    it('should render full page loading overlay', () => {
      render(<FullPageLoading />);
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<FullPageLoading message="جاري حفظ البيانات..." />);
      expect(screen.getByText('جاري حفظ البيانات...')).toBeInTheDocument();
    });

    it('should have fixed positioning', () => {
      const { container } = render(<FullPageLoading />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('fixed', 'inset-0');
    });

    it('should have high z-index for overlay', () => {
      const { container } = render(<FullPageLoading />);
      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('z-50');
    });
  });

  describe('SkeletonLoader', () => {
    it('should render skeleton with default lines', () => {
      render(<SkeletonLoader />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      render(<SkeletonLoader />);
      expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
    });

    it('should render specified number of lines', () => {
      const { container } = render(<SkeletonLoader lines={5} />);
      const lines = container.querySelectorAll('.h-4.bg-muted');
      expect(lines.length).toBe(5);
    });

    it('should render avatar when showAvatar is true', () => {
      const { container } = render(<SkeletonLoader showAvatar={true} />);
      const avatar = container.querySelector('.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should not render avatar by default', () => {
      const { container } = render(<SkeletonLoader />);
      const avatar = container.querySelector('.rounded-full');
      expect(avatar).not.toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('should render table skeleton', () => {
      render(<TableSkeleton />);
      expect(screen.getByTestId('table-skeleton')).toBeInTheDocument();
    });

    it('should render correct number of rows', () => {
      const { container } = render(<TableSkeleton rows={3} />);
      const rows = container.querySelectorAll('.py-2');
      expect(rows.length).toBe(3);
    });

    it('should render correct number of columns', () => {
      const { container } = render(<TableSkeleton rows={1} columns={6} />);
      const cells = container.querySelectorAll('.py-2 .flex-1');
      expect(cells.length).toBe(6);
    });

    it('should have animate-pulse on cells', () => {
      const { container } = render(<TableSkeleton />);
      const animatedCells = container.querySelectorAll('.animate-pulse');
      expect(animatedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Loading States Integration', () => {
    it('should show loading then content', async () => {
      const TestComponent = () => {
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => setLoading(false), 100);
          return () => clearTimeout(timer);
        }, []);

        if (loading) return <LoadingSpinner text="جاري التحميل..." />;
        return <div>المحتوى المحمل</div>;
      };

      render(<TestComponent />);
      
      expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText('المحتوى المحمل')).toBeInTheDocument();
      });
    });

    it('should handle multiple loading states', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByTestId('spinner')).toHaveClass('h-4');

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByTestId('spinner')).toHaveClass('h-12');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
    });

    it('should provide screen reader only text', () => {
      render(<LoadingSpinner />);
      const srOnly = screen.getByText('جاري التحميل...');
      expect(srOnly).toHaveClass('sr-only');
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic loading text correctly', () => {
      render(<LoadingSpinner text="يرجى الانتظار..." />);
      expect(screen.getByText('يرجى الانتظار...')).toBeInTheDocument();
    });

    it('should handle long Arabic messages', () => {
      render(<FullPageLoading message="جاري معالجة طلبك، يرجى الانتظار قليلاً..." />);
      expect(screen.getByText('جاري معالجة طلبك، يرجى الانتظار قليلاً...')).toBeInTheDocument();
    });
  });
});
