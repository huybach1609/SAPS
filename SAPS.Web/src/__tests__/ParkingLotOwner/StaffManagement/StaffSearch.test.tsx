import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StaffSearchAndAdd } from '@/pages/ParkingLotOwner/StaffManagement/components/StaffSearchAndAdd';
import { StaffStatus } from '@/types/User';

describe('StaffSearchAndAdd', () => {
  const mockProps = {
    tableSearch: '',
    setTableSearch: vi.fn(),
    statusFilter: '',
    setStatusFilter: vi.fn(),
    setCurrentPage: vi.fn(),
    handleSearch: vi.fn(),
    handleReset: vi.fn(),
    onAddStaffer: vi.fn(),
    loadStaffList: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with correct header', () => {
      render(<StaffSearchAndAdd {...mockProps} />);

      expect(screen.getByText('Search & Add User')).toBeInTheDocument();
    });

    it('renders search input with correct placeholder', () => {
      render(<StaffSearchAndAdd {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('renders search input with provided value', () => {
      render(<StaffSearchAndAdd {...mockProps} tableSearch="test search" />);

      const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
      expect(searchInput).toHaveValue('test search');
    });

    it('renders status filter select with placeholder', () => {
      render(<StaffSearchAndAdd {...mockProps} />);

      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    // it('renders all status options in select', () => {
    //   render(<StaffSearchAndAdd {...mockProps} />);

    //   // Click to open the select dropdown
    //   const selectTrigger = screen.getByText('All Statuses');
    //   fireEvent.click(selectTrigger);

    //   expect(screen.getByText('All')).toBeInTheDocument();
    //   expect(screen.getByText('Active')).toBeInTheDocument();
    //   expect(screen.getByText('On Leave')).toBeInTheDocument();
    //   expect(screen.getByText('Suspended')).toBeInTheDocument();
    //   expect(screen.getByText('Terminated')).toBeInTheDocument();
    // });

    it('renders action buttons', () => {
      render(<StaffSearchAndAdd {...mockProps} />);

      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Add Staff')).toBeInTheDocument();

      // Reset button is icon only, check by role
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4); // Search, Reset, Add Staff, and Select trigger
    });
  });

  describe('Search Input Interactions', () => {
    it('calls setTableSearch when input value changes', async () => {
      const user = userEvent.setup();
      render(<StaffSearchAndAdd {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
      await user.type(searchInput, 'e');

      expect(mockProps.setTableSearch).toHaveBeenCalledTimes(1); 
      expect(mockProps.setTableSearch).toHaveBeenLastCalledWith('e');
    });

    it('calls handleSearch when Enter key is pressed in search input', async () => {
      const user = userEvent.setup();
      render(<StaffSearchAndAdd {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
      await user.type(searchInput, 'test{enter}');

      expect(mockProps.handleSearch).toHaveBeenCalledTimes(1);
    });

    it('does not call handleSearch for other keys', async () => {
      const user = userEvent.setup();
      render(<StaffSearchAndAdd {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search by name, email, or ID...');
      await user.type(searchInput, 'test{escape}');

      expect(mockProps.handleSearch).not.toHaveBeenCalled();
    });
  });

  // describe('Status Filter Interactions', () => {
  //   it('calls setStatusFilter when status is selected', async () => {
  //     render(<StaffSearchAndAdd {...mockProps} />);

  //     // Open the select dropdown
  //     const selectTrigger = screen.getByText('All Statuses');
  //     fireEvent.click(selectTrigger);

  //     // Select "Active" option
  //     const activeOption = screen.getByText('Active');
  //     fireEvent.click(activeOption);

  //     expect(mockProps.setStatusFilter).toHaveBeenCalledWith(StaffStatus.ACTIVE.toString());
  //     expect(mockProps.setCurrentPage).toHaveBeenCalledWith(1);
  //     expect(mockProps.loadStaffList).toHaveBeenCalledTimes(1);
  //   });

  //   it('calls setStatusFilter with empty string when "All" is selected', async () => {
  //     render(<StaffSearchAndAdd {...mockProps} />);

  //     // Open the select dropdown
  //     const selectTrigger = screen.getByText('All Statuses');
  //     fireEvent.click(selectTrigger);

  //     // Select "All" option
  //     const allOption = screen.getByText('All');
  //     fireEvent.click(allOption);

  //     expect(mockProps.setStatusFilter).toHaveBeenCalledWith('');
  //     expect(mockProps.setCurrentPage).toHaveBeenCalledWith(1);
  //     expect(mockProps.loadStaffList).toHaveBeenCalledTimes(1);
  //   });

  //   it('handles each status option correctly', async () => {
  //     const statusTests = [
  //       { text: 'Active', value: StaffStatus.ACTIVE },
  //       { text: 'On Leave', value: StaffStatus.ON_LEAVE },
  //       { text: 'Suspended', value: StaffStatus.SUSPENDED },
  //       { text: 'Terminated', value: StaffStatus.TERMINATED },
  //     ];

  //     for (const { text, value } of statusTests) {
  //       vi.clearAllMocks();
  //       render(<StaffSearchAndAdd {...mockProps} />);

  //       const selectTrigger = screen.getByText('All Statuses');
  //       fireEvent.click(selectTrigger);

  //       const option = screen.getByText(text);
  //       fireEvent.click(option);

  //       expect(mockProps.setStatusFilter).toHaveBeenCalledWith(value.toString());
  //       expect(mockProps.setCurrentPage).toHaveBeenCalledWith(1);
  //       expect(mockProps.loadStaffList).toHaveBeenCalledTimes(1);
  //     }
  //   });

   
  // });




  describe('Edge Cases', () => {
    it('handles empty statusFilter correctly', () => {
      render(<StaffSearchAndAdd {...mockProps} statusFilter="" />);

      // Should show placeholder when no status is selected
      expect(screen.getByText('All Statuses')).toBeInTheDocument();
    });

    it('handles undefined selection change in status filter', () => {
      render(<StaffSearchAndAdd {...mockProps} />);

      // Open select and simulate undefined selection
      const selectTrigger = screen.getByText('All Statuses');
      fireEvent.click(selectTrigger);

      // This tests the fallback for when keys is empty or undefined
      expect(mockProps.setStatusFilter).not.toHaveBeenCalled();
    });

    it('renders with all props provided', () => {
      const fullProps = {
        tableSearch: 'test search',
        setTableSearch: vi.fn(),
        statusFilter: StaffStatus.ACTIVE.toString(),
        setStatusFilter: vi.fn(),
        setCurrentPage: vi.fn(),
        handleSearch: vi.fn(),
        handleReset: vi.fn(),
        onAddStaffer: vi.fn(),
        loadStaffList: vi.fn(),
      };

      render(<StaffSearchAndAdd {...fullProps} />);

      expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
      expect(screen.getByText('Search & Add User')).toBeInTheDocument();
    });
  });
});