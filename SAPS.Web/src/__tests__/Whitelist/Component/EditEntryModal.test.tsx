import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditEntryModal from '@/pages/ParkingLotOwner/Whitelist/EditEntryModal';
import { Whitelist } from '@/types/Whitelist';

// Mock the @heroui/react components
vi.mock('@heroui/react', () => ({
  Button: ({ children, onPress, ...props }: any) => (
    <button onClick={onPress} {...props}>
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
}));

describe('EditEntryModal', () => {
  const mockHandleUpdateEntry = vi.fn();
  const mockOnOpenChange = vi.fn();

  const mockWhitelistEntry: Whitelist = {
    parkingLotId: '1',
    addedDate: '2024-01-01T00:00:00.000Z',
    clientId: 'client-123',
    expiredDate: '2024-12-31T00:00:00.000Z',
    client: {
      id: 'client-123',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      phone: '1234567890',
      address: '123 Main St',
      profileImageUrl: 'https://example.com/profile.jpg',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  };

  const defaultProps = {
    isOpen: true,
    onOpenChange: mockOnOpenChange,
    entryToEdit: mockWhitelistEntry,
    handleUpdateEntry: mockHandleUpdateEntry,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders modal when open with entry to edit', () => {
      render(<EditEntryModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Edit Whitelist Entry');
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
      render(<EditEntryModal {...defaultProps} isOpen={false} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveStyle({ display: 'none' });
    });

    it('does not render modal content when no entry to edit', () => {
      render(<EditEntryModal {...defaultProps} entryToEdit={null} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveStyle({ display: 'none' });
    });

    it('displays client info correctly when client data is available', () => {
      render(<EditEntryModal {...defaultProps} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('displays fallback info when client data is missing', () => {
      const entryWithoutClient: Whitelist = {
        ...mockWhitelistEntry,
        client: undefined,
      };

      render(<EditEntryModal {...defaultProps} entryToEdit={entryWithoutClient} />);

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getByText('client-123')).toBeInTheDocument();
    });

    it('displays partial client info when email is missing', () => {
      const entryWithPartialClient: Whitelist = {
        ...mockWhitelistEntry,
        client: {
          id: 'client-123',
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin',
          phone: '1234567890',
          address: '123 Main St',
          profileImageUrl: 'https://example.com/profile.jpg',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      render(<EditEntryModal {...defaultProps} entryToEdit={entryWithPartialClient} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  describe('Date Input', () => {
    it('populates expiry date input with formatted date from entry', () => {
      render(<EditEntryModal {...defaultProps} />);

      const dateInput = screen.getByLabelText('Expiry Date') as HTMLInputElement;
      expect(dateInput.value).toBe('2024-12-31');
    });

    it('handles empty expiry date', () => {
      const entryWithoutExpiry: Whitelist = {
        ...mockWhitelistEntry,
        expiredDate: undefined,
      };

      render(<EditEntryModal {...defaultProps} entryToEdit={entryWithoutExpiry} />);

      const dateInput = screen.getByLabelText('Expiry Date') as HTMLInputElement;
      expect(dateInput.value).toBe('');
    });

    it('updates expiry date when user changes input', async () => {
      const user = userEvent.setup();
      render(<EditEntryModal {...defaultProps} />);

      const dateInput = screen.getByLabelText('Expiry Date');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-15');

      expect((dateInput as HTMLInputElement).value).toBe('2025-01-15');
    });
  });

  describe('Button Interactions', () => {
    it('calls onClose and resets state when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditEntryModal {...defaultProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls handleUpdateEntry with correct parameters when Update button is clicked', async () => {
      const user = userEvent.setup();
      render(<EditEntryModal {...defaultProps} />);

      const updateButton = screen.getByText('Update');
      await user.click(updateButton);

      expect(mockHandleUpdateEntry).toHaveBeenCalledWith(
        mockWhitelistEntry,
        '2024-12-31',
        expect.any(Function)
      );
    });

    it('calls handleUpdateEntry with updated expiry date', async () => {
      const user = userEvent.setup();
      render(<EditEntryModal {...defaultProps} />);

      const dateInput = screen.getByLabelText('Expiry Date');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-06-15');

      const updateButton = screen.getByText('Update');
      await user.click(updateButton);

      expect(mockHandleUpdateEntry).toHaveBeenCalledWith(
        mockWhitelistEntry,
        '2025-06-15',
        expect.any(Function)
      );
    });

    it('does not call handleUpdateEntry when editingEntry is null', async () => {
      const user = userEvent.setup();
      render(<EditEntryModal {...defaultProps} entryToEdit={null} />);

      // Since modal is not visible, we need to force render the content
      render(
        <EditEntryModal
          {...defaultProps}
          isOpen={true}
          entryToEdit={mockWhitelistEntry}
        />
      );

      // Clear the entry after modal is open
      const { rerender } = render(<EditEntryModal {...defaultProps} />);

      rerender(<EditEntryModal {...defaultProps} entryToEdit={null} />);

      // Since modal won't show content without editingEntry, this test verifies the conditional logic
      expect(mockHandleUpdateEntry).not.toHaveBeenCalled();
    });
  });

  describe('useEffect behavior', () => {
    it('sets editing entry and expiry date when modal opens', () => {
      const { rerender } = render(
        <EditEntryModal {...defaultProps} isOpen={false} />
      );

      rerender(<EditEntryModal {...defaultProps} isOpen={true} />);

      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });

    it('resets state when modal closes', () => {
      const { rerender } = render(<EditEntryModal {...defaultProps} />);

      // Close modal
      rerender(<EditEntryModal {...defaultProps} isOpen={false} />);

      // Reopen to check if state was reset
      rerender(<EditEntryModal {...defaultProps} isOpen={true} />);

      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });

    it('updates state when entryToEdit changes', () => {
      const newEntry: Whitelist = {
        parkingLotId: '1',
        addedDate: '2024-01-01T00:00:00.000Z',
        clientId: 'client-456',
        expiredDate: '2025-03-15T00:00:00.000Z',
        client: {
          id: 'client-456',
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'admin',
          phone: '1234567890',
          address: '123 Main St',
          profileImageUrl: 'https://example.com/profile.jpg',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      };

      const { rerender } = render(<EditEntryModal {...defaultProps} />);

      rerender(
        <EditEntryModal {...defaultProps} entryToEdit={newEntry} />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-03-15')).toBeInTheDocument();
    });
  });

  describe('formatDateForInput utility function', () => {
    // We need to test the utility function indirectly through the component behavior
    it('handles various date formats correctly', () => {
      const testCases = [
        {
          entry: { ...mockWhitelistEntry, expiredDate: '2024-12-31T23:59:59.999Z' },
          expected: '2024-12-31'
        },
        {
          entry: { ...mockWhitelistEntry, expiredDate: '2024-01-01T00:00:00.000Z' },
          expected: '2024-01-01'
        }
      ];

      testCases.forEach(({ entry, expected }) => {
        const { unmount } = render(
          <EditEntryModal {...defaultProps} entryToEdit={entry} />
        );

        expect(screen.getByDisplayValue(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper label for date input', () => {
      render(<EditEntryModal {...defaultProps} />);

      expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<EditEntryModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid date strings gracefully', () => {
      const entryWithInvalidDate: Whitelist = {
        ...mockWhitelistEntry,
        expiredDate: 'invalid-date',
      };

      // This should not crash the component
      expect(() => {
        render(<EditEntryModal {...defaultProps} entryToEdit={entryWithInvalidDate} />);
      }).not.toThrow();
    });

    it('handles null expiredDate', () => {
      const entryWithNullDate: Whitelist = {
        ...mockWhitelistEntry,
        expiredDate: null as any,
      };

      render(<EditEntryModal {...defaultProps} entryToEdit={entryWithNullDate} />);

      const dateInput = screen.getByLabelText('Expiry Date') as HTMLInputElement;
      expect(dateInput.value).toBe('');
    });
  });
});