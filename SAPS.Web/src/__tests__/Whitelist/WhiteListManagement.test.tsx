// __tests__/WhiteListManagement.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { WhitelistManagement } from '@/pages/ParkingLotOwner/Whitelist/WhiteListManagement';
import * as ParkingLotContext from '../../pages/ParkingLotOwner/ParkingLotContext';
import * as whitelistService from '@/services/parkinglot/whitelistService';
import { ParkingLot } from '@/types/ParkingLot';
import { PaginatedWhitelistResponse } from '@/types/Whitelist';

vi.mock('../../pages/ParkingLotOwner/ParkingLotContext');
vi.mock('@/services/parkinglot/whitelistService');
vi.mock('./WhiteListStatus', () => ({
  default: () => <div>Whitelist Status</div>
}));
vi.mock('./WhiteListModal', () => ({
  default: () => <div>Add File Modal</div>
}));
vi.mock('./AddUserModal', () => ({
  default: () => <div>Add User Modal</div>
}));
vi.mock('./EditEntryModal', () => ({
  default: () => <div>Edit Entry Modal</div>
}));

vi.mock('@/layouts/default', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }
})





const mockParkingLotContext = vi.mocked(ParkingLotContext);
const mockWhitelistService = vi.mocked(whitelistService);

describe('WhitelistManagement', () => {
  const mockParkingLot: ParkingLot = {
    id: 'parking-lot-123',
    name: 'Test Parking Lot',
    address: '123 Main St',
    totalParkingSlot: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parkingLotOwnerId: 'parking-lot-owner-123',
    status: 'Active'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockParkingLotContext.useParkingLot.mockReturnValue({
      selectedParkingLot: mockParkingLot,
      loading: false,
      parkingLots: [],
      selectedParkingLotId: null,
      setSelectedParkingLotId: vi.fn(),
      refresh: vi.fn()
    });

    mockWhitelistService.fetchWhitelist.mockResolvedValue({
      data: [],
      pagination: {
        pageSize: 10,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }
    });
  });

  it('should render main components', async () => {
    render(
      <WhitelistManagement />
    );

    expect(screen.getByText('Whitelist Status')).toBeInTheDocument();
    expect(screen.getByText('Search & Add User')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No users in whitelist yet.')).toBeInTheDocument();
    });
  });

  it('should show loading spinner while data is being fetched', () => {
    mockWhitelistService.fetchWhitelist.mockImplementation(() =>
      new Promise(() => { }) // Never resolves
    );

    render(<WhitelistManagement />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('should display whitelist table when data is available', async () => {
    const mockData: PaginatedWhitelistResponse = {
      data: [
        {
          clientId: 'user-1',
          parkingLotId: 'parking-lot-123',
          addedDate: '2023-01-01T00:00:00Z',
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
          }
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        pageSize: 10
      }
    };

    mockWhitelistService.fetchWhitelist.mockResolvedValue(mockData);

    render(
      <WhitelistManagement />
    );


    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('should handle pagination correctly', async () => {
    const mockDataWithPagination: PaginatedWhitelistResponse = {
      data: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 3,
        totalItems: 18,
        hasPreviousPage: false,
        hasNextPage: true
      }
    };

    mockWhitelistService.fetchWhitelist.mockResolvedValue(mockDataWithPagination);

    render(
      <WhitelistManagement />
    );

    await waitFor(() => {
      expect(screen.getByText('Showing page 1 of 3 (18 total items)')).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });
});