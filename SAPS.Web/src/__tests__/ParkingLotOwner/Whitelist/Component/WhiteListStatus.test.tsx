import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

import { AuthProvider } from "@/services/auth/AuthContext";
import WhitelistStatusComponent from "@/pages/ParkingLotOwner/Whitelist/WhiteListStatus";

vi.mock("@/services/parkinglot/whitelistService", () => ({
  fetchWhitelistStatus: vi.fn(() =>
    Promise.resolve({
      tottalWhitelistUsers: 100,
      activeUser: 59,
      expiringThisWeek: 932,
    }),
  ),
}));

describe("WhitelistStatusComponent", () => {
  it("should fetch and display whitelist status", async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/owner/whitelist/status"]}>
          <Routes>
            <Route
              element={
                <WhitelistStatusComponent
                  loadparking={false}
                  parkingLotId="test-id"
                />
              }
              path="/owner/whitelist/status"
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    // Assert that the mocked values are displayed
    await waitFor(() => {
      expect(screen.getByText(/100/)).toBeInTheDocument(); // totalWhitelistUsers
      expect(screen.getByText(/59/)).toBeInTheDocument(); // activeUser
      expect(screen.getByText(/932/)).toBeInTheDocument(); // expiringThisWeek
    });
  });
});
