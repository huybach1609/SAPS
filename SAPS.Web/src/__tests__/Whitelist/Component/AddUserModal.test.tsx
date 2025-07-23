import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserModal from '@/pages/ParkingLotOwner/Whitelist/AddUserModal';
import { searchUser } from '@/services/parkinglot/whitelistService';
import { User } from '@/types/User';


// Mock HeroUI components
vi.mock('@heroui/react', () => ({
  Input: ({ value, onChange, placeholder, type, 'data-testid': testId, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      data-testid={testId}
      {...props}
    />
  ),
  Button: ({ children, onPress, disabled, color, variant, className, ...props }: any) => (
    <button
      onClick={onPress}
      disabled={disabled}
      className={className}
      data-testid={`button-${children?.toLowerCase?.()?.replace(/\s+/g, '-') || 'button'}`}
      {...props}
    >
      {children}
    </button>
  ),
  Modal: ({ children, isOpen }: any) => (
    <div data-testid="modal" style={{ display: isOpen ? 'block' : 'none' }}>
      {children}
    </div>
  ),
  ModalContent: ({ children }: any) => (
    <div data-testid="modal-content">
      {typeof children === 'function' ? children(() => { }) : children}
    </div>
  ),
  ModalHeader: ({ children }: any) => (
    <div data-testid="modal-header">{children}</div>
  ),
  ModalBody: ({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  ),
  ModalFooter: ({ children }: any) => (
    <div data-testid="modal-footer">{children}</div>
  ),

  Spinner: ({ size }: any) => <div data-testid="spinner" data-size={size}>Loading...</div>,
  useDisclosure: () => ({ isOpen: false, onOpen: vi.fn(), onClose: vi.fn(), onOpenChange: vi.fn() }),
}));

describe('AddUserModal', () => {
  const mockUsers: User[] =
    [
      {
        id: "1",
        email: "john.doe@example.com",
        fullName: "John Doe",
        phone: "+1-202-555-0143",
        address: "123 Main St, Springfield, IL",
        profileImageUrl: "https://example.com/images/users/john.jpg",
        role: "admin",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: "2",
        email: "jane.smith@example.com",
        fullName: "Jane Smith",
        phone: "+1-202-555-0176",
        address: "456 Oak Ave, Lincoln, NE",
        profileImageUrl: "https://example.com/images/users/jane.jpg",
        role: "admin",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: "3",
        email: "michael.nguyen@example.com",
        fullName: "Michael Nguyen",
        phone: "+84-90-123-4567",
        address: "89 Lê Lợi, Q.1, TP. HCM, Vietnam",
        profileImageUrl: "https://example.com/images/users/michael.jpg",
        role: "admin",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: "4",
        email: "sophia.lee@example.com",
        fullName: "Sophia Lee",
        phone: "+1-415-555-0102",
        address: "789 Pine St, San Francisco, CA",
        profileImageUrl: "https://example.com/images/users/sophia.jpg",
        role: "admin",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    ];

  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    onAddToWhitelist: vi.fn(),
    parkingLotId: 'parking-lot-1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<AddUserModal {...defaultProps} />);

      expect(screen.getByTestId('modal-header')).toHaveTextContent('Add User to Whitelist');
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Search user by Citizen ID and add to parking whitelist')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<AddUserModal {...defaultProps} isOpen={false} />);
      expect(screen.getByTestId('modal')).toHaveStyle({ display: 'none' })
    });

    it('should render all from elements', () => {
      render(<AddUserModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument();
      expect(screen.getByLabelText("Expiry Date (Optional)")).toBeInTheDocument();
      expect(screen.getByTestId('button-add-to-whitelist')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should have Add button disabled initially', () => {
      render(<AddUserModal {...defaultProps} />);

      const addButton = screen.getByTestId('button-add-to-whitelist');
      expect(addButton).toBeDisabled();
    });
  });

  vi.mock('@/services/parkinglot/whitelistService', () => ({
    searchUser: vi.fn(),
    fetchWhitelist: vi.fn(),
    addToWhitelist: vi.fn(),
    removeFromWhitelist: vi.fn(),
    updateWhitelistEntry: vi.fn(),
    fetchWhitelistStatus: vi.fn(),
  }));

  describe('Search Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllMocks();
    });

    it('should trigger search after typing with debounce (real timers)', async () => {

      vi.useRealTimers();

      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');

      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(mockSearchWhitelist).toHaveBeenCalledWith('john', 'parking-lot-1');
      });
    }, 10000);


    it('should display loading spinner during search', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockUsers), 100)));

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');

      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

    });

    it('should display search results', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');

      // Wait for debounce and the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 350));

      // Wait for React to update the DOM
      await waitFor(() => {
        expect(mockSearchWhitelist).toHaveBeenCalledWith('john', 'parking-lot-1');
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display "No results found" when search returns empty array', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue([]);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');

      await userEvent.type(searchInput, 'nonexistent');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle search error gracefully', async () => {

      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockRejectedValue(new Error('Search failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');

      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(e => setTimeout(e, 300));
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to search users:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('User Selection', () => {
    vi.useRealTimers();
    beforeEach(async () => {
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);
    });

    it('should select user when clicked', async () => {
      vi.useRealTimers();

      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const userElement = screen.getByText('John Doe').closest('div[class*="p-3"]');
      await userEvent.click(userElement!);

      expect(screen.getByText('Selected: John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('button-add-to-whitelist')).not.toBeDisabled();
    });


    it('should highlight selected user in search results', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Get the clickable parent div (the one with the conditional classes)
      const userElement = screen.getByText('John Doe').closest('div[class*="p-3"]');

      await userEvent.click(userElement!);
      await waitFor(() => {
        expect(userElement).toHaveClass('bg-blue-50', 'border-l-4', 'border-blue-500');
      }, { timeout: 2000 });

    });
  });

  describe('Date Input', () => {
    it('should handle expiry date input', async () => {
      vi.useRealTimers();
      render(<AddUserModal {...defaultProps} />);

      const dateInput = screen.getByLabelText('Expiry Date (Optional)');
      await userEvent.type(dateInput, '2024-12-31');

      expect(dateInput).toHaveValue('2024-12-31');
    });

    it('should format date correctly for input', () => {
      vi.useRealTimers();
      render(<AddUserModal {...defaultProps} />);

      const dateInput = screen.getByLabelText('Expiry Date (Optional)');

      // Test the formatDateForInput function indirectly
      fireEvent.change(dateInput, { target: { value: '2024-12-31' } });
      expect(dateInput).toHaveAttribute('value', '2024-12-31');
    });
  });

  describe('Form Submission', () => {
    it('should call onAddToWhitelist when Add button is clicked with selected user', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      const mockOnAddToWhitelist = vi.fn().mockResolvedValue(null);

      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} onAddToWhitelist={mockOnAddToWhitelist} />);

      // Search and select user
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');


      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('John Doe'));

      // Set expiry date
      const dateInput = screen.getByLabelText('Expiry Date (Optional)');
      await userEvent.type(dateInput, '2024-12-31');

      // Click Add button
      await userEvent.click(screen.getByTestId('button-add-to-whitelist'));

      expect(mockOnAddToWhitelist).toHaveBeenCalledWith(mockUsers[0], '2024-12-31');
    });

    it('should display error message when onAddToWhitelist returns error', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      const mockOnAddToWhitelist = vi.fn().mockResolvedValue('User already exists');

      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} onAddToWhitelist={mockOnAddToWhitelist} />);

      // Search and select user
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('John Doe'));
      await userEvent.click(screen.getByTestId('button-add-to-whitelist'));

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
    });

    it('should reset form and close modal on successful add', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      const mockOnAddToWhitelist = vi.fn().mockResolvedValue(null);
      const mockOnOpenChange = vi.fn().mockResolvedValue(null);

      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} onAddToWhitelist={mockOnAddToWhitelist} onOpenChange={mockOnOpenChange} />);

      // Search and select user
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('John Doe'));
      await userEvent.click(screen.getByTestId('button-add-to-whitelist'));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onOpenChange when Cancel button is clicked', async () => {
      vi.useRealTimers();
      const mockOnOpenChange = vi.fn().mockResolvedValue(null);

      render(<AddUserModal {...defaultProps} onOpenChange={mockOnOpenChange} />);

      await userEvent.click(screen.getByTestId('button-cancel'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form when Cancel is clicked', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      // Fill form
      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('John Doe'));

      const dateInput = screen.getByLabelText('Expiry Date (Optional)');
      await userEvent.type(dateInput, '2024-12-31');

      // Cancel
      await userEvent.click(screen.getByTestId('button-cancel'));

      // Form should be reset (this would need to be tested by reopening modal)
      expect(searchInput).toHaveAttribute('value', '');
      expect(dateInput).toHaveAttribute('value', '');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty parkingLotId', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} parkingLotId="" />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await waitFor(() => {
        expect(mockSearchWhitelist).toHaveBeenCalledWith('john', '');
      });
    });

    it('should not search when search term is empty', async () => {
      vi.useRealTimers();
      const mockSearchWhitelist = vi.mocked(searchUser);
      mockSearchWhitelist.mockResolvedValue(mockUsers);

      render(<AddUserModal {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      await userEvent.type(searchInput, 'john');

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      await userEvent.clear(searchInput);

      // Should only have been called once (when typing 'john')
      expect(mockSearchWhitelist).toHaveBeenCalledTimes(1);
    });

    it('should handle Add button click without selected user', async () => {
      vi.useRealTimers();
      const mockOnAddToWhitelist = vi.fn();

      render(<AddUserModal {...defaultProps} onAddToWhitelist={mockOnAddToWhitelist} />);

      // Try to click disabled button (should not call the function)
      const addButton = screen.getByTestId('button-add-to-whitelist');
      expect(addButton).toBeDisabled();

      // Button is disabled, so this click should not trigger anything
      await userEvent.click(addButton);

      expect(mockOnAddToWhitelist).not.toHaveBeenCalled();
    });
  });
});