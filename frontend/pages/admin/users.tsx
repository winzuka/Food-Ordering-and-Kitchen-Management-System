import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import adminUserService from "@/services/adminUserService";
import { User } from "@/types/admin-user";

interface UsersPageProps {
  initialUsers: User[];
  initialError: string | null;
}

const UsersPage = ({ initialUsers, initialError }: UsersPageProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Updated to include all status types from your admin-user.ts
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ACTIVE" | "BLOCKED" | "SUSPENDED" | "PENDING"
  >("all");

  // Updated to match your CUSTOMER/ADMIN roles
  const [roleFilter, setRoleFilter] = useState<"all" | "CUSTOMER" | "ADMIN">(
    "all"
  );

  useEffect(() => {
    if (initialUsers.length === 0 && !initialError) {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getAllUsers({
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchTerm || undefined,
      });

      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(
        err.message ||
          "Failed to fetch users. Please check if the User Service is running on port 8081."
      );
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (
    userId: number,
    newStatus: "ACTIVE" | "BLOCKED" | "SUSPENDED" | "PENDING"
  ) => {
    try {
      await adminUserService.updateUserStatus(userId, newStatus);

      // Update local state immediately for better UX
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          getUserId(user) === userId ? { ...user, status: newStatus } : user
        )
      );

      toast.success(`User status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Error updating user status:", err);
      setError(`Failed to update user status: ${err.message}`);
      toast.error("Failed to update user status");
    }
  };

  // Helper functions to handle property name differences
  const getFirstName = (user: any) => user.firstName || user.first_name || "";
  const getLastName = (user: any) => user.lastName || user.last_name || "";
  const getUserId = (user: any) => user.id || user.user_id;
  const getPhone = (user: any) =>
    user.phone || user.phone_number || user.phoneNumber;
  const getCreatedAt = (user: any) => user.createdAt || user.created_at;

  // Helper function to get user initials safely
  const getUserInitials = (user: any) => {
    const firstName = getFirstName(user);
    const lastName = getLastName(user);

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

    if (!firstName && !lastName && user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }

    return firstInitial + lastInitial || "??";
  };

  // Client-side filtering (in addition to server-side filtering)
  const filteredUsers = users.filter((user) => {
    const statusMatch =
      statusFilter === "all" || (user.status || "ACTIVE") === statusFilter;
    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    const firstName = getFirstName(user);
    const lastName = getLastName(user);
    const email = user.email || "";

    const searchMatch =
      !searchTerm ||
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && roleMatch && searchMatch;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
      case "BLOCKED":
        return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium";
      case "PENDING":
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium";
      case "CUSTOMER":
        return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
    }
  };

  const getActionButtons = (user: User) => {
    const currentStatus = user.status || "ACTIVE";
    const userId = getUserId(user);

    if (user.role === "ADMIN") {
      return <span className="text-gray-500 text-sm">Protected</span>;
    }

    switch (currentStatus) {
      case "ACTIVE":
        return (
          <div className="flex gap-2">
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
              onClick={() => handleUserStatusChange(userId, "BLOCKED")}
              title="Block user"
            >
              Block
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
              onClick={() => handleUserStatusChange(userId, "SUSPENDED")}
              title="Suspend user"
            >
              Suspend
            </button>
          </div>
        );
      case "BLOCKED":
      case "SUSPENDED":
        return (
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
            onClick={() => handleUserStatusChange(userId, "ACTIVE")}
            title="Activate user"
          >
            Activate
          </button>
        );
      case "PENDING":
        return (
          <div className="flex gap-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
              onClick={() => handleUserStatusChange(userId, "ACTIVE")}
              title="Approve user"
            >
              Approve
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
              onClick={() => handleUserStatusChange(userId, "BLOCKED")}
              title="Reject user"
            >
              Reject
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Head>
        <title>User Management - Admin Panel</title>
      </Head>

      <div className="p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage application users and their access
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black outline-none"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "all" | "CUSTOMER" | "ADMIN")
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500  text-black"
              >
                <option value="all">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "ACTIVE"
                      | "BLOCKED"
                      | "SUSPENDED"
                      | "PENDING"
                  )
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500  text-black"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="BLOCKED">Blocked</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1L21 3m-6 6l2.5 2.5L21 7.5"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => {
                    const firstName = getFirstName(user);
                    const lastName = getLastName(user);
                    const fullName =
                      `${firstName} ${lastName}`.trim() || user.username || "Unknown User";
                    const userId = getUserId(user);
                    const phone = getPhone(user);
                    const createdAt = getCreatedAt(user);

                    return (
                      <tr
                        key={userId}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <span className="text-sm font-medium text-blue-700">
                                {getUserInitials(user)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {userId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.email || "No email"}
                          </div>
                          {phone && (
                            <div className="text-sm text-gray-500">{phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={getRoleBadgeClass(
                              user.role || "CUSTOMER"
                            )}
                          >
                            {user.role || "CUSTOMER"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={getStatusBadgeClass(
                              user.status || "ACTIVE"
                            )}
                          >
                            {user.status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : "Unknown"}
                        </td>
                        <td className="px-6 py-4">{getActionButtons(user)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results Info */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await adminUserService.getAllUsers();
    return {
      props: {
        initialUsers: response.data || [],
        initialError: null,
      },
    };
  } catch (error: any) {
    console.error("SSR User Fetch Error:", error);
    return {
      props: {
        initialUsers: [],
        initialError:
          error.message ||
          "Failed to fetch users during server-side rendering.",
      },
    };
  }
};

export default UsersPage;
