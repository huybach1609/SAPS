import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@heroui/react";

import Whitelist from "@/pages/ParkingLotOwner/Whitelist/WhiteListManagement";
import * as whitelistService from "@/services/parkinglot/whitelistService";
import { useParkingLot } from "@/pages/ParkingLotOwner/ParkingLotContext";
import { AuthProvider } from "@/services/auth/AuthContext";
// import { useToast } from "@heroui/react";

// Mock the useParkingLot hook
vi.mock("@/pages/ParkingLotOwner/ParkingLotContext", () => ({
  useParkingLot: vi.fn(),
}));

// Mock the service functions
vi.mock("@/services/parkinglot/whitelistService", () => ({
  fetchWhitelist: vi.fn(),
  addToWhitelist: vi.fn(),
  removeFromWhitelist: vi.fn(),
  updateWhitelistEntry: vi.fn(),
  fetchWhitelistStatus: vi.fn(),
  searchWhitelist: vi.fn(),
}));

vi.mock("@/hooks/useToast", () => ({
  addToast: vi.fn(),
}));

describe("Whitelist Management", () => {
  const mockParkingLot = { id: "lot1" };

  beforeEach(() => {
    // @ts-ignore
    useParkingLot.mockReturnValue({
      selectedParkingLot: mockParkingLot,
      loading: false,
    });

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it("renders Whitelist table and controls", async () => {
    (whitelistService.fetchWhitelist as any).mockResolvedValue({
      data: [
        {
          parkingLotId: "lot1",
          clientId: "user1",
          client: {
            fullName: "John Doe",
            email: "john@example.com",
            profileImageUrl: "",
          },
          addedDate: new Date().toISOString(),
          expiredDate: null,
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/owner/whitelist"]}>
          <Routes>
            <Route element={<Whitelist />} path="/owner/whitelist" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    // Wait for table to appear
    expect(await screen.findByText("Whitelist")).toBeInTheDocument();
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Add User")).toBeInTheDocument();
    expect(screen.getByText("Add File")).toBeInTheDocument();
  });

  it("calls fetchWhitelist on mount", async () => {
    (whitelistService.fetchWhitelist as any).mockResolvedValue({
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/owner/whitelist"]}>
          <Routes>
            <Route element={<Whitelist />} path="/owner/whitelist" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(whitelistService.fetchWhitelist).toHaveBeenCalledWith(
        "lot1",
        6,
        1,
      );
    });
  });
});
