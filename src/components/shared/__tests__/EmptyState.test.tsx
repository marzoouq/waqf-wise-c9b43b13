import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../EmptyState';
import { FileText } from 'lucide-react';
import userEvent from '@testing-library/user-event';

describe('EmptyState', () => {
  it('renders with required props', () => {
    const { getByText } = render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
      />
    );

    expect(getByText('لا توجد بيانات')).toBeInTheDocument();
    expect(getByText('ابدأ بإضافة بيانات جديدة')).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();
    const { getByText } = render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
        actionLabel="إضافة"
        onAction={handleAction}
      />
    );

    const button = getByText('إضافة');
    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    const { queryByRole } = render(
      <EmptyState
        icon={FileText}
        title="لا توجد بيانات"
        description="ابدأ بإضافة بيانات جديدة"
      />
    );

    expect(queryByRole('button')).not.toBeInTheDocument();
  });
});
