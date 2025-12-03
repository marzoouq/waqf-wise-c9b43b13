import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageErrorBoundary } from '../PageErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('PageErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <PageErrorBoundary pageName="اختبار">
        <div>محتوى صحيح</div>
      </PageErrorBoundary>
    );

    expect(getByText('محتوى صحيح')).toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const { getByText } = render(
      <PageErrorBoundary pageName="اختبار">
        <ThrowError />
      </PageErrorBoundary>
    );

    expect(getByText(/حدث خطأ/)).toBeInTheDocument();

    console.error = originalError;
  });
});
