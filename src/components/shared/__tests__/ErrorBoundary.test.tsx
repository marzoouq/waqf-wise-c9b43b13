import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>محتوى صحيح</div>
      </ErrorBoundary>
    );

    expect(getByText('محتوى صحيح')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(getByText(/حدث خطأ غير متوقع/)).toBeInTheDocument();

    console.error = originalError;
  });
});
