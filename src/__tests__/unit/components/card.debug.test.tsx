import { test } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { Card } from '@/components/ui/card';

test('debug card parentElement via @testing-library/dom', () => {
  render(<Card className="custom-card">Content</Card>);
  // eslint-disable-next-line no-console
  console.log(screen.getByText('Content').parentElement?.outerHTML);
});
