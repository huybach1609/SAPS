// __tests__/components/WhitelistSearchBar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { WhitelistSearchBar } from '@/components/ui/whitelist/WhitelistSearchBar';

describe('WhitelistSearchBar', () => {
  const mockProps = {
    searchValue: '',
    onSearchChange: vi.fn(),
    onSearch: vi.fn(),
    onReset: vi.fn(),
    onAddUser: vi.fn(),
    onAddFile: vi.fn(),
  };

  it('should render search input and buttons', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    expect(screen.getByPlaceholderText('Search by name, email, or ID...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByText('Add File')).toBeInTheDocument();
  });

  it('should call onSearchChange when input value changes', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('john');
  });

  it('should call onSearch when search button is clicked', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('should call onSearch when Enter key is pressed in search input', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('should call onReset when reset button is clicked', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    const resetButton = screen.getByTestId('reset-button');
    fireEvent.click(resetButton);

    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('should call onAddUser when Add User button is clicked', () => {
    render(<WhitelistSearchBar {...mockProps} />);

    const addUserButton = screen.getByText('Add User');
    fireEvent.click(addUserButton);

    expect(mockProps.onAddUser).toHaveBeenCalled();
  });
});