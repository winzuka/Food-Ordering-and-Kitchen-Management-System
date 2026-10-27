import React from "react";
import { User } from "@/types/admin-user";
import { formatDate } from "@/utils/dateUtils";

interface UserTableProps {
  users: User[];
  onUserStatusChange: (userId: number, newStatus: "ACTIVE" | "BLOCKED") => void;
  onViewUserInfo: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onUserStatusChange,
  onViewUserInfo,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-accent-100 text-accent-700 border-accent-200";
      case "STAFF":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "CUSTOMER":
        return "bg-info-100 text-info-700 border-info-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "ACTIVE"
      ? "bg-success-100 text-success-700 border-success-200"
      : "bg-accent-100 text-accent-700 border-accent-200";
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1L21 3m-6 6l2.5 2.5L21 7.5"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-1">
          No users found
        </h3>
        <p className="text-neutral-600">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {users.map((user) => (
            <tr
              key={user.user_id}
              className="hover:bg-neutral-50 transition-colors"
            >
              {/* User Info */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {user.first_name.charAt(0)}
                      {user.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-neutral-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-neutral-500">
                      ID: {user.user_id}
                    </div>
                  </div>
                </div>
              </td>

              {/* Contact */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-900">{user.email}</div>
                {user.phone_number && (
                  <div className="text-sm text-neutral-500">
                    {user.phone_number}
                  </div>
                )}
              </td>

              {/* Role */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                    user.status || "ACTIVE"
                  )}`}
                >
                  {user.status || "ACTIVE"}
                </span>
              </td>

              {/* Joined Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                {formatDate(user.created_at)}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onViewUserInfo(user)}
                  className="bg-info-500 hover:bg-info-600 text-white px-3 py-1 rounded-md transition-colors text-xs"
                >
                  View Info
                </button>

                {user.role !== "ADMIN" && (
                  <button
                    onClick={() =>
                      onUserStatusChange(
                        user.user_id,
                        (user.status || "ACTIVE") === "ACTIVE"
                          ? "BLOCKED"
                          : "ACTIVE"
                      )
                    }
                    className={`px-3 py-1 rounded-md transition-colors text-xs ${
                      (user.status || "ACTIVE") === "ACTIVE"
                        ? "bg-accent-500 hover:bg-accent-600 text-white"
                        : "bg-success-500 hover:bg-success-600 text-white"
                    }`}
                  >
                    {(user.status || "ACTIVE") === "ACTIVE"
                      ? "Block"
                      : "Unblock"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
