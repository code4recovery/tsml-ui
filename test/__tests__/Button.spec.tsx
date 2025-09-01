import { fireEvent, render, screen } from '@testing-library/react';

import Button from '../../src/components/Button';

describe('<Button />', () => {
  it('passes props correctly', () => {
    const mockOnClick = jest.fn();

    render(
      <Button
        href="https://bar.com"
        icon="back"
        onClick={mockOnClick}
        text="baz"
      />
    );

    const icon = screen.getByTestId('icon-back');
    const button = screen.getByRole('link');

    expect(icon).toBeInTheDocument();
    expect(button).toHaveAttribute('href', 'https://bar.com');
    expect(button).toHaveTextContent('baz');

    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('responds to small prop correctly', () => {
    render(<Button href="https://bar.com" icon="back" />);

    const icon = screen.getByTestId('icon-back');

    expect(icon).toHaveAttribute('height', '20');
    expect(icon).toHaveAttribute('width', '20');
  });
});
