import React from "react";
import { User } from "@/types/admin-user";

interface UserStatusBadgeProps {
  user: User;
  size?: "xs" | "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outlined" | "subtle";
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  user,
  size = "sm",
  showIcon = true,
  variant = "default",
}) => {
  const status = user.status || "ACTIVE";
  const isActive = status === "ACTIVE";

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-1.5 py-0.5 text-xs";
      case "sm":
        return "px-2 py-1 text-xs";
      case "md":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-2 py-1 text-xs";
    }
  };

  const getVariantClasses = () => {
    const baseClasses = "inline-flex items-center font-medium rounded-full";

    if (variant === "outlined") {
      return isActive
        ? `${baseClasses} border-2 border-success-200 text-success-700 bg-transparent`
        : `${baseClasses} border-2 border-accent-200 text-accent-700 bg-transparent`;
    }

    if (variant === "subtle") {
      return isActive
        ? `${baseClasses} bg-success-50 text-success-600 border border-success-100`
        : `${baseClasses} bg-accent-50 text-accent-600 border border-accent-100`;
    }

    // Default variant
    return isActive
      ? `${baseClasses} bg-success-100 text-success-700 border border-success-200`
      : `${baseClasses} bg-accent-100 text-accent-700 border border-accent-200`;
  };

  const getStatusIcon = () => {
    if (!showIcon) return null;

    const iconSize =
      size === "xs" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

    if (isActive) {
      return (
        <svg
          className={`${iconSize} mr-1`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className={`${iconSize} mr-1`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "BLOCKED":
        return "Blocked";
      case "SUSPENDED":
        return "Suspended";
      case "PENDING":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <span
      className={`${getSizeClasses()} ${getVariantClasses()}`}
      title={`User is ${getStatusText().toLowerCase()}`}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </span>
  );
};

// Additional utility component for status indicator with tooltip
export const UserStatusIndicator: React.FC<{
  user: User;
  showLabel?: boolean;
}> = ({ user, showLabel = false }) => {
  const status = user.status || "ACTIVE";
  const isActive = status === "ACTIVE";

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isActive ? "bg-success-500" : "bg-accent-500"
        }`}
        title={`User is ${status.toLowerCase()}`}
      />
      {showLabel && (
        <span
          className={`text-xs ${
            isActive ? "text-success-600" : "text-accent-600"
          }`}
        >
          {status}
        </span>
      )}
    </div>
  );
};

export default UserStatusBadge;
