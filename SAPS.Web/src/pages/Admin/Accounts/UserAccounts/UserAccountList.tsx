import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Pagination, Spinner } from "@heroui/react";
import { userService, ClientUser } from "@/services/user/userService";

const UserAccountList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5; // Hiển thị 5 người dùng mỗi trang
  const [successMessage] = useState<string | null>(null);

  // Temporary state for input fields
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getAllClientUsers();
        if (response.success && response.data) {
          setUsers(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to fetch user data");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and status
  const filteredUsers = users.filter((user: ClientUser) => {
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const items = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="w-full flex flex-col">
      {/* Back button */}
      <div className="mb-2">
        <button
          onClick={() => navigate("/admin/accounts")}
          className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Account List
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading user data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full">
        <div className="flex items-center mb-1 w-full">
          <svg
            className="w-6 h-6 mr-2 text-indigo-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-indigo-900">User Accounts</h1>
        </div>
        <p className="text-gray-500 mb-4">
          Manage user accounts and permissions
        </p>
      </div>

      {/* User Statistics Cards */}
      {loading ? (
        <div className="w-full flex justify-center items-center py-8">
          <Spinner size="lg" color="primary" />
          <span className="ml-2 text-blue-600">Loading user data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 w-full">
          <div className="bg-[#00b4d8] rounded-lg p-4 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{users.length}</div>
              <div className="text-sm">Total Users</div>
            </div>
          </div>

          <div className="bg-[#0096c7] rounded-lg p-4 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {users.filter((a: ClientUser) => a.status === "active").length}
              </div>
              <div className="text-sm">Active Users</div>
            </div>
          </div>

          <div className="bg-[#48cae4] rounded-lg p-4 text-white w-full">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">
                {
                  users.filter((a: ClientUser) => a.status === "suspended")
                    .length
                }
              </div>
              <div className="text-sm">Suspended Users</div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Actions Section */}
      <div className="border border-gray-200 rounded-lg shadow-sm p-6 mb-4 w-full flex-grow">
        <div className="border-l-4 border-blue-600 pl-4 mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              Search & Actions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Search Users
            </label>
            <Input
              placeholder="Search by name, email..."
              value={tempSearchQuery}
              onChange={(e) => setTempSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={tempStatusFilter}
              onChange={(e) => setTempStatusFilter(e.target.value)}
              style={{ height: "42px" }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between w-full gap-4">
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              color="primary"
              className="bg-blue-600 rounded-full text-black"
              startContent={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              onPress={() => {
                // Apply filters from temporary states
                setSearchQuery(tempSearchQuery);
                setStatusFilter(tempStatusFilter);
                setPage(1); // Reset to first page when applying new filters
              }}
            >
              Search
            </Button>

            <Button
              color="default"
              variant="light"
              className="rounded-full"
              onPress={() => {
                // Clear all filters
                setTempSearchQuery("");
                setTempStatusFilter("");
                setSearchQuery("");
                setStatusFilter("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* User Account List Section */}
      <div className="border border-gray-200 rounded-lg shadow-sm p-6 w-full flex-grow">
        <div className="border-l-4 border-blue-600 pl-4 mb-4 w-full">
          <div className="flex items-center w-full">
            <svg
              className="w-5 h-5 mr-2 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              User Account List
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" color="primary" />
            <span className="ml-3">Loading user accounts...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No user accounts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating a new user account."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-full table-fixed border-collapse">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[25%]">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[25%]">
                    Email Address
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[20%]">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {(page - 1) * rowsPerPage + items.indexOf(user) + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.createdAt}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        <button
                          className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full flex items-center"
                          onClick={() => {
                            console.log("Navigating to user detail:", user);
                            navigate(`/admin/accounts/users/${user.id}`, {
                              state: { user },
                            });
                          }}
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Permission Note */}
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
              <p>
                <span className="font-semibold">User Management:</span> User
                account statuses are managed via the user detail page. Access
                user information carefully and respect privacy regulations.
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm w-full">
          <div className="mb-2 md:mb-0">
            Showing {(page - 1) * rowsPerPage + 1} to{" "}
            {Math.min(page * rowsPerPage, filteredUsers.length)} of{" "}
            {filteredUsers.length} entries
          </div>

          <div className="flex justify-end w-full md:w-auto items-center gap-2">
            <Button
              size="sm"
              variant="light"
              color="primary"
              className="rounded-full flex items-center"
              isDisabled={page === 1}
              onPress={() => setPage(Math.max(1, page - 1))}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </Button>

            <Pagination
              total={pages}
              page={page}
              onChange={setPage}
              classNames={{
                item: "text-black",
                cursor: "bg-blue-900 text-white",
              }}
            />

            <Button
              size="sm"
              variant="light"
              color="primary"
              className="rounded-full flex items-center"
              isDisabled={page === pages}
              onPress={() => setPage(Math.min(pages, page + 1))}
            >
              Next
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountList;
