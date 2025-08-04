import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UseDisclosureProps } from "@heroui/react";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";

import AddFileModal from "@/pages/ParkingLotOwner/Whitelist/WhiteListModal";

const mockDisclosure: UseDisclosureProps = {
  isOpen: true,
  onOpen: vi.fn(),
  onClose: vi.fn(),
};

describe("AddFileModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders and shows Choose File button", () => {
    render(
      <AddFileModal
        addFileModalDisclosure={mockDisclosure}
        parkingLotId="test-lot"
      />,
    );
    expect(screen.getByText(/Choose File/i)).toBeInTheDocument();
  });

  it("accepts a valid CSV file and shows success state", async () => {
    render(
      <AddFileModal
        addFileModalDisclosure={mockDisclosure}
        parkingLotId="test-lot"
      />,
    );

    const file = new File(["CitizenID\n123456789012"], "test.csv", {
      type: "text/csv",
    });
    const fileInput = document.querySelector('input[type="file"]');

    if (!fileInput) throw new Error("File input not found");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/File Ready to Upload!/i)).toBeInTheDocument();
    });
  });

  it("rejects an invalid file type and shows error", async () => {
    render(
      <AddFileModal
        addFileModalDisclosure={mockDisclosure}
        parkingLotId="test-lot"
      />,
    );

    const file = new File(["not a csv"], "test.txt", { type: "text/plain" });
    const fileInput = document.querySelector('input[type="file"]');

    if (!fileInput) throw new Error("File input not found");

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Upload Failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Please upload a valid CSV or Excel file/i),
      ).toBeInTheDocument();
    });
  });

  it("uploads file to API and shows success", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as Mock;

    render(
      <AddFileModal
        addFileModalDisclosure={mockDisclosure}
        parkingLotId="test-lot"
      />,
    );

    const file = new File(["CitizenID\n123456789012"], "test.csv", {
      type: "text/csv",
    });
    const fileInput = document.querySelector('input[type="file"]');

    if (!fileInput) throw new Error("File input not found");
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/File Ready to Upload!/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByText(/Upload to API/i);

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(
        screen.getByText(/File uploaded to server successfully/i),
      ).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});
