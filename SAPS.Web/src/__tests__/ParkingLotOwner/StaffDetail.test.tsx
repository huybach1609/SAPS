import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

import StaffDetailScreen from "../../pages/ParkingLotOwner/StaffManagement/StaffDetail";

import { AuthProvider } from "@/services/auth/AuthContext";

// Mock fetchStaffDetail
vi.mock("@/services/parkinglot/staffService", () => ({
  fetchStaffDetail: vi.fn(() =>
    Promise.resolve({
      userId: "1",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "123456789",
      profileImageUrl: "",
      userStatus: "active",
      createdAt: "2024-06-01T12:00:00Z",
      updatedAt: "2024-06-02T12:00:00Z",
      staffId: "S1",
      parkingLotId: "P1",
      parkingLotName: "Lot A",
      parkingLotAddress: "123 Main St",
      parkingLotStatus: "operational",
    }),
  ),
}));

// vi.mock('../../assets/Default/blank-profile-picture.webp', () => 'blank-profile-picture.webp');

describe("StaffDetailScreen", () => {
  it("renders staff details when data is loaded", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/owner/staff/P1/S1"]}>
          <Routes>
            <Route
              element={<StaffDetailScreen />}
              path="/owner/staff/:parkingLotId/:staffId"
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    // Wait for the staff name to appear
    expect(await screen.findByText("John Doe")).toBeTruthy();
    expect(screen.getByText("john@example.com")).toBeTruthy();
    expect(screen.getByText("Lot A")).toBeTruthy();
    expect(screen.getByText("123 Main St")).toBeTruthy();
    expect(screen.getByText("S1", { exact: false })).toBeTruthy();
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("operational")).toBeTruthy();
  });
});
