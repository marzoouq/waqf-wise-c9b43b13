import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
  it('renders with children', () => {
    const { getByText } = render(<Button>انقر هنا</Button>);
    expect(getByText('انقر هنا')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { getByText } = render(<Button onClick={handleClick}>انقر</Button>);

    await user.click(getByText('انقر'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    const { getByRole } = render(<Button isLoading>تحميل</Button>);
    expect(getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when isLoading', () => {
    const { getByRole } = render(<Button isLoading>تحميل</Button>);
    const button = getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { rerender, getByRole } = render(<Button variant="destructive">حذف</Button>);
    expect(getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">حد</Button>);
    expect(getByRole('button')).toHaveClass('border-input');
  });

  it('applies size classes correctly', () => {
    const { rerender, getByRole } = render(<Button size="sm">صغير</Button>);
    expect(getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">كبير</Button>);
    expect(getByRole('button')).toHaveClass('h-11');
  });

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>معطل</Button>);
    expect(getByRole('button')).toBeDisabled();
  });

  it('can be disabled by both isLoading and disabled', () => {
    const { getByRole } = render(<Button isLoading disabled>معطل ويحمل</Button>);
    expect(getByRole('button')).toBeDisabled();
  });
});
