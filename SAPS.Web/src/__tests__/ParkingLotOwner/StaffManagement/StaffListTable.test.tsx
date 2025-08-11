import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StaffListTable } from '@/pages/ParkingLotOwner/StaffManagement/components/StaffListTable';
import { User, StaffProfile, StaffStatus } from '@/types/User';
import { ParkingLot } from '@/types/ParkingLot';

// Mock the utility functions
vi.mock('@/components/utils/stringUtils', () => ({
  formatPhoneNumber: vi.fn((phone: string) => phone)
}));

vi.mock('@/components/utils/staffUtils', () => ({
  StaffStatusBadge: vi.fn(({ status }) => <span data-testid="status-badge">{status}</span>)
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test data
const mockStaffProfile: StaffProfile = {
  userId: 'user-1',
  staffId: 'STAFF-001',
  parkingLotId: 'lot-1',
  status: StaffStatus.ACTIVE
};

const mockUser: User = {
  id: 'user-1',
  email: 'john.doe@example.com',
  role: 'admin',
  fullName: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St',
  profileImageUrl: 'https://example.com/avatar.jpg',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  staffProfile: mockStaffProfile
};

const mockParkingLot: ParkingLot = {
  id: 'lot-1',
  name: 'Test Parking Lot'
} as ParkingLot;

const mockUpdateModalDisclosure = {
  isOpen: false,
  onOpen: vi.fn(),
  onClose: vi.fn(),
  onOpenChange: vi.fn()
};

// Wrapper component for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('StaffListTable', () => {
  const defaultProps = {
    staffList: [mockUser],
    selectUser: null,
    setSelectUser: vi.fn(),
    parkingLot: mockParkingLot,
    updateModalDisclosure: mockUpdateModalDisclosure,
    handleRemoveFromStaffList: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the table with correct headers', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Staff ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email & Phone')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays staff information correctly', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('STAFF-001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('displays "Unknown User" when fullName is not provided', () => {
    const userWithoutName = { ...mockUser, fullName: '' };
    
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} staffList={[userWithoutName]} />
      </TestWrapper>
    );

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
  });

  it('displays "No phone" when phone is not provided', () => {
    const userWithoutPhone = { ...mockUser, phone: '' };
    
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} staffList={[userWithoutPhone]} />
      </TestWrapper>
    );

    expect(screen.getByText('No phone')).toBeInTheDocument();
  });

  it('formats and displays the creation date', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );
    // Check that the date is formatted (exact format may vary by locale)
    expect(screen.getByText(/1\/1\/2024|2024-01-01|01\/01\/2024/)).toBeInTheDocument();
  });

  it('renders status badge with correct status', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );

    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toHaveTextContent('0'); // StaffStatus.ACTIVE
  });


  it('opens dropdown menu and shows action items', async () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );

    // Click the dropdown trigger (ellipsis button)
    const dropdownTrigger = screen.getByRole('button');
    fireEvent.click(dropdownTrigger);

    // Check if dropdown items are present
    expect(screen.getByText('Detail')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Deactivate')).toBeInTheDocument();
  });

  it('navigates to detail page when Detail action is clicked', async () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} />
      </TestWrapper>
    );

    const dropdownTrigger = screen.getByRole('button');
    fireEvent.click(dropdownTrigger);

    const detailButton = screen.getByText('Detail');
    fireEvent.click(detailButton);

    expect(mockNavigate).toHaveBeenCalledWith('/owner/staff/lot-1/STAFF-001');
  });

  it('opens update modal when Update action is clicked', async () => {
    const setSelectUserMock = vi.fn();
    
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} setSelectUser={setSelectUserMock} />
      </TestWrapper>
    );

    const dropdownTrigger = screen.getByRole('button');
    fireEvent.click(dropdownTrigger);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    expect(setSelectUserMock).toHaveBeenCalledWith(mockUser);
    expect(mockUpdateModalDisclosure.onOpen).toHaveBeenCalled();
  });

  // it('calls handleRemoveFromStaffList when Deactivate action is clicked', async () => {
  //   const handleRemoveFromStaffListMock = vi.fn();
    
  //   render(
  //     <TestWrapper>
  //       <StaffListTable {...defaultProps} handleRemoveFromStaffList={handleRemoveFromStaffListMock} />
  //     </TestWrapper>
  //   );

  //   const dropdownTrigger = screen.getByRole('button');
  //   fireEvent.click(dropdownTrigger);

  //   const deactivateButton = screen.getByText('Deactivate');
  //   fireEvent.click(deactivateButton);

  //   expect(handleRemoveFromStaffListMock).toHaveBeenCalledWith('STAFF-001');
  // });

  it('handles empty staff list', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} staffList={[]} />
      </TestWrapper>
    );

    // Should still render headers
    expect(screen.getByText('Staff ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('handles staff without staffProfile', () => {
    const userWithoutStaffProfile = { ...mockUser, staffProfile: undefined };
    
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} staffList={[userWithoutStaffProfile]} />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('displays selected user correctly', () => {
    render(
      <TestWrapper>
        <StaffListTable {...defaultProps} selectUser={mockUser} />
      </TestWrapper>
    );

    // The table should show the selected user
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});