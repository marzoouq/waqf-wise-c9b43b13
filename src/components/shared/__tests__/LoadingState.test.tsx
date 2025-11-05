import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('renders with default message', () => {
    const { getByText } = render(<LoadingState />);
    expect(getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const { getByText } = render(<LoadingState message="جاري تحميل البيانات" />);
    expect(getByText('جاري تحميل البيانات')).toBeInTheDocument();
  });

  it('renders in fullscreen mode', () => {
    const { container } = render(<LoadingState fullScreen />);
    expect(container.firstChild).toHaveClass('min-h-screen');
  });

  it('renders with different sizes', () => {
    const { rerender, getByRole } = render(<LoadingState size="sm" />);
    expect(getByRole('status')).toHaveClass('h-4');
    expect(getByRole('status')).toHaveClass('w-4');

    rerender(<LoadingState size="lg" />);
    expect(getByRole('status')).toHaveClass('h-12');
    expect(getByRole('status')).toHaveClass('w-12');
  });
});
