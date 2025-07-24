// __tests__/components/WhitelistTable.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { WhitelistTable } from '@/components/ui/whitelist/WhitelistTable';
import type { Whitelist } from '@/types/Whitelist';

describe('WhitelistTable', () => {
  const mockWhitelist: Whitelist[] = [
    {
      parkingLotId: "1",
      clientId: "U001",
      addedDate: "2025-06-01T17:00:00+07:00",
      expiredDate: "2025-06-01T17:00:00+07:00",
      client: {
        id: "U001",
        email: "john.doe@example.com",
        fullName: "John Doe",
        phone: "123456789",
        address: "123 Main St, Cityville",
        role: "admin",
        profileImageUrl: "https://example.com/profile.jpg",
        isActive: true,
        createdAt: "2025-06-01T17:00:00+07:00",
        updatedAt: "2025-06-01T17:00:00+07:00"
      }
    },
    {
      parkingLotId: "1",
      clientId: "U002",
      addedDate: "2025-06-03T21:30:00+07:00",
      expiredDate: undefined,
      client: {
        id: "U002",
        email: "jane.smith@example.com",
        fullName: "Jane Smith",
        phone: "987654321",
        address: "456 Elm St, Townsville",
        role: "admin",
        profileImageUrl: "https://example.com/profile.jpg",
        isActive: true,
        createdAt: "2025-06-03T21:30:00+07:00",
        updatedAt: "2025-06-03T21:30:00+07:00"
      }
    },
  ];

  const mockProps = {
    whitelist: mockWhitelist,
    onEdit: vi.fn(),
    onRemove: vi.fn(),
  };

  it('should render whitelist entries', () => {
    render(<WhitelistTable {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('No expiry')).toBeInTheDocument();
  });

  it('should show correct status for active and expired entries', () => {
    render(<WhitelistTable {...mockProps} />);

    // Check for status badges
    expect(screen.getByTestId('expired-badge')).toBeInTheDocument();
    expect(screen.getByTestId('active-badge')).toBeInTheDocument();
    const expiredBadges = screen.getAllByTestId('expired-badge');
    const activeBadges = screen.getAllByTestId('active-badge');
    expect(expiredBadges).toHaveLength(1);
    expect(activeBadges).toHaveLength(1);
  });


  it('should call onEdit when edit button is clicked', () => {
    render(<WhitelistTable {...mockProps} />);

    const editButton = screen.getByTestId('edit-button-U001');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockWhitelist[0]);
  });

  it('should call onRemove when remove button is clicked', () => {
    render(<WhitelistTable {...mockProps} />);

    const removeButtons = screen.getAllByLabelText(/Remove/);
    fireEvent.click(removeButtons[0]);

    expect(mockProps.onRemove).toHaveBeenCalledWith('U001');
  });

  it('should display profile image when available', () => {
    const whitelistWithImage = [{
      ...mockWhitelist[0],
      client: {
        ...mockWhitelist[0].client!,
        profileImageUrl: 'https://example.com/profile.jpg'
      }
    }];

    render(<WhitelistTable {...mockProps} whitelist={whitelistWithImage} />);

    const profileImage = screen.getByAltText('Profile');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', 'https://example.com/profile.jpg');
  });
});