import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "xs" | "sm" | "md" | "lg";
  outlined?: boolean;
  rounded?: "sm" | "md" | "lg" | "full";
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  outlined = false,
  rounded = "full",
  dot = false,
  icon,
  className = "",
  onClick,
}) => {
  const getVariantClasses = () => {
    const colors = {
      primary: outlined
        ? "border-primary-200 text-primary-700 bg-transparent"
        : "bg-primary-100 text-primary-700 border-primary-200",
      secondary: outlined
        ? "border-secondary-200 text-secondary-700 bg-transparent"
        : "bg-secondary-100 text-secondary-700 border-secondary-200",
      success: outlined
        ? "border-success-200 text-success-700 bg-transparent"
        : "bg-success-100 text-success-700 border-success-200",
      warning: outlined
        ? "border-warning-200 text-warning-700 bg-transparent"
        : "bg-warning-100 text-warning-700 border-warning-200",
      danger: outlined
        ? "border-accent-200 text-accent-700 bg-transparent"
        : "bg-accent-100 text-accent-700 border-accent-200",
      info: outlined
        ? "border-info-200 text-info-700 bg-transparent"
        : "bg-info-100 text-info-700 border-info-200",
      neutral: outlined
        ? "border-neutral-300 text-neutral-700 bg-transparent"
        : "bg-neutral-100 text-neutral-700 border-neutral-200",
    };

    return colors[variant];
  };

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

  const getRoundedClasses = () => {
    switch (rounded) {
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-full";
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-500";
      case "secondary":
        return "bg-secondary-500";
      case "success":
        return "bg-success-500";
      case "warning":
        return "bg-warning-500";
      case "danger":
        return "bg-accent-500";
      case "info":
        return "bg-info-500";
      case "neutral":
        return "bg-neutral-500";
      default:
        return "bg-neutral-500";
    }
  };

  const baseClasses = `
    inline-flex items-center font-medium border
    transition-colors duration-200
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${getRoundedClasses()}
    ${onClick ? "cursor-pointer hover:opacity-80" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const content = (
    <>
      {dot && <span className={`h-2 w-2 rounded-full mr-2 ${getDotColor()}`} />}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button className={baseClasses} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <span className={baseClasses}>{content}</span>;
};

export default Badge;

// Status badge variants for common use cases
interface StatusBadgeProps {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "cancelled"
    | "blocked";
  size?: "xs" | "sm" | "md" | "lg";
  outlined?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  outlined = false,
}) => {
  const getVariantFromStatus = () => {
    switch (status) {
      case "active":
      case "completed":
        return "success";
      case "inactive":
      case "cancelled":
      case "blocked":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getStatusText = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge
      variant={getVariantFromStatus()}
      size={size}
      outlined={outlined}
      dot={true}
    >
      {getStatusText()}
    </Badge>
  );
};

// Role badge for user roles
interface RoleBadgeProps {
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  size?: "xs" | "sm" | "md" | "lg";
  outlined?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "sm",
  outlined = false,
}) => {
  const getVariantFromRole = () => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "STAFF":
        return "warning";
      case "CUSTOMER":
        return "info";
      default:
        return "neutral";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "ADMIN":
        return (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "STAFF":
        return (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case "CUSTOMER":
        return (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Badge
      variant={getVariantFromRole()}
      size={size}
      outlined={outlined}
      icon={getRoleIcon()}
    >
      {role}
    </Badge>
  );
};
