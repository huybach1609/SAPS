import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useWhitelistManagement } from '@/hooks/useWhitelistManagement';
import * as whitelistService from '@/services/parkinglot/whitelistService';
import { User } from '@/types/User';
import { PaginatedWhitelistResponse } from '@/types/Whitelist';

// Mock the service
vi.mock('@/services/parkinglot/whitelistService');

const mockWhitelistService = vi.mocked(whitelistService);

describe('useWhitelistManagement', () => {
  const mockParkingLotId = 'parking-lot-123';
  const mockWhitelistData: PaginatedWhitelistResponse = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockWhitelistService.fetchWhitelist.mockResolvedValue(mockWhitelistData);
  });

  it('should load whitelist data on mount', async () => {
    const { result } = renderHook(() => useWhitelistManagement(mockParkingLotId));

    expect(result.current.loading).toBe(true);

    // Wait for the service to be called
    await vi.waitFor(() => {
      expect(mockWhitelistService.fetchWhitelist).toHaveBeenCalled();
    });

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockWhitelistService.fetchWhitelist).toHaveBeenCalledWith(
      mockParkingLotId,
      6,
      1,
      ""
    );
    expect(result.current.whitelist).toEqual(mockWhitelistData.data);
    expect(result.current.pagination).toEqual(mockWhitelistData.pagination);
  });

  it('should handle search correctly', async () => {
    const { result } = renderHook(() => useWhitelistManagement(mockParkingLotId));

    await act(async () => {
      result.current.setTableSearch('john');
    });

    await act(async () => {
      result.current.handleSearch();
    });

    expect(mockWhitelistService.fetchWhitelist).toHaveBeenCalledWith(
      mockParkingLotId,
      6,
      1,
      'john'
    );
  });

  it('should handle add to whitelist', async () => {
    const mockUser: User = { id: 'user-2', fullName: 'Jane Doe', email: 'jane.doe@example.com', role: 'admin', phone: '1234567890', address: '123 Main St', profileImageUrl: 'https://example.com/profile.jpg', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' };
    const expiryDate: string = new Date('2024-01-01').toISOString();

    mockWhitelistService.addToWhitelist.mockResolvedValue({
      clientId: 'user-2',
      parkingLotId: mockParkingLotId,
      addedDate: expiryDate,
      expiredDate: expiryDate,
      client: mockUser
    });

    const { result } = renderHook(() => useWhitelistManagement(mockParkingLotId));

    let error;
    await act(async () => {
      error = await result.current.handleAddToWhitelist(mockUser, expiryDate);
    });

    expect(error).toBeNull();
    expect(mockWhitelistService.addToWhitelist).toHaveBeenCalledWith(
      mockParkingLotId,
      mockUser.id,
      expiryDate
    );
  });

  it('should return error message when add to whitelist fails', async () => {
    const mockUser: User = { id: 'user-2', fullName: 'Jane Doe', email: 'jane.doe@example.com', role: 'admin', phone: '1234567890', address: '123 Main St', profileImageUrl: 'https://example.com/profile.jpg', isActive: true, createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' };
    const errorMessage: string = 'User already exists';

    mockWhitelistService.addToWhitelist.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWhitelistManagement(mockParkingLotId));

    let error;
    await act(async () => {
      error = await result.current.handleAddToWhitelist(mockUser, new Date('2024-01-01').toISOString());
    });

    expect(error).toBe(errorMessage);
  });

  it('should handle remove from whitelist', async () => {
    mockWhitelistService.removeFromWhitelist.mockResolvedValue(undefined);

    const { result } = renderHook(() => useWhitelistManagement(mockParkingLotId));

    await act(async () => {
      await result.current.handleRemoveFromWhitelist('user-1');
    });

    expect(mockWhitelistService.removeFromWhitelist).toHaveBeenCalledWith(
      mockParkingLotId,
      'user-1'
    );
  });
});
