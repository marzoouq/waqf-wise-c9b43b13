import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />);
    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<LoadingState message="جاري تحميل البيانات" />);
    expect(screen.getByText('جاري تحميل البيانات')).toBeInTheDocument();
  });

  it('renders in fullscreen mode', () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<LoadingState size="sm" />);
    
    // Find the loader icon by class
    const smallLoader = container.querySelector('.animate-spin');
    expect(smallLoader).toHaveClass('h-4');
    expect(smallLoader).toHaveClass('w-4');

    rerender(<LoadingState size="lg" />);
    const largeLoader = container.querySelector('.animate-spin');
    expect(largeLoader).toHaveClass('h-12');
    expect(largeLoader).toHaveClass('w-12');
  });
});
