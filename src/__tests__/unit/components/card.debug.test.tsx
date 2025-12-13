import { test } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from '@/components/ui/card';

test('debug card render output', () => {
  const { container } = render(<Card className="custom-card">Content</Card>);
  // Log HTML for debugging failing test
  // eslint-disable-next-line no-console
  console.log(container.innerHTML);
});
