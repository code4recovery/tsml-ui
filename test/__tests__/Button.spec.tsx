import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Button from '../../src/components/Button';

describe('<Button />', () => {
  afterEach(() => {
    cleanup();
  });

  it('passes props correctly', () => {
    const mockOnClick = vi.fn();

    const { getByTestId, getByRole } = render(
      <Button
        href="https://bar.com"
        icon="back"
        onClick={mockOnClick}
        text="baz"
      />
    );

    const icon = getByTestId('icon-back');
    const button = getByRole('link');

    expect(icon).toBeInTheDocument();
    expect(button).toHaveAttribute('href', 'https://bar.com');
    expect(button).toHaveTextContent('baz');

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('responds to small prop correctly', () => {
    const { getByTestId } = render(<Button href="https://bar.com" icon="back" />);

    const icon = getByTestId('icon-back');

    expect(icon).toHaveAttribute('height', '20');
    expect(icon).toHaveAttribute('width', '20');
  });
});
