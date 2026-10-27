import React, { useState } from "react";
import { User } from "@/types/admin-user";
import { toast } from "react-hot-toast";

interface BlockUserButtonProps {
  user: User;
  onStatusChange: (userId: number, newStatus: "ACTIVE" | "BLOCKED") => void;
  size?: "sm" | "md" | "lg";
  showConfirmation?: boolean;
}

const BlockUserButton: React.FC<BlockUserButtonProps> = ({
  user,
  onStatusChange,
  size = "sm",
  showConfirmation = true,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentStatus = user.status || "ACTIVE";
  const isBlocked = currentStatus === "BLOCKED";
  const newStatus = isBlocked ? "ACTIVE" : "BLOCKED";
  const actionText = isBlocked ? "Unblock" : "Block";

  const handleClick = () => {
    if (showConfirmation) {
      setShowConfirmModal(true);
    } else {
      handleStatusChange();
    }
  };

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true);
      await onStatusChange(user.user_id, newStatus);
      setShowConfirmModal(false);

      toast.success(`User ${actionText.toLowerCase()}ed successfully`, {
        icon: isBlocked ? "✅" : "🚫",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(`Failed to ${actionText.toLowerCase()} user`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show block button for admin users
  if (user.role === "ADMIN") {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1 text-xs";
      case "md":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-3 py-1 text-xs";
    }
  };

  const getButtonClasses = () => {
    const baseClasses = `${getSizeClasses()} rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;

    if (isBlocked) {
      return `${baseClasses} bg-success-500 hover:bg-success-600 text-white shadow-sm hover:shadow`;
    } else {
      return `${baseClasses} bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow`;
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={getButtonClasses()}
        title={`${actionText} ${user.first_name} ${user.last_name}`}
      >
        {isUpdating ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <span>{isBlocked ? "✅" : "🚫"}</span>
            <span>{actionText}</span>
          </div>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowConfirmModal(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-elevated max-w-md w-full p-6">
              <div className="text-center">
                <div
                  className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                    isBlocked ? "bg-success-100" : "bg-accent-100"
                  }`}
                >
                  <span className="text-2xl">{isBlocked ? "✅" : "🚫"}</span>
                </div>

                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  {actionText} User Account
                </h3>

                <p className="text-sm text-neutral-600 mb-6">
                  Are you sure you want to {actionText.toLowerCase()}{" "}
                  <strong>
                    {user.first_name} {user.last_name}
                  </strong>
                  ?
                  {!isBlocked && (
                    <span className="block mt-2 text-accent-600">
                      This will prevent them from logging into the application.
                    </span>
                  )}
                  {isBlocked && (
                    <span className="block mt-2 text-success-600">
                      This will restore their access to the application.
                    </span>
                  )}
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-4 py-2 rounded-md transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={isUpdating}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors text-white ${
                      isBlocked
                        ? "bg-success-500 hover:bg-success-600"
                        : "bg-accent-500 hover:bg-accent-600"
                    }`}
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      `${actionText} User`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockUserButton;
