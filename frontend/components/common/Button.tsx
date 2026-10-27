import React, { forwardRef } from "react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = "md",
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "primary":
          return "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 text-white border-transparent";
        case "secondary":
          return "bg-secondary-500 hover:bg-secondary-600 focus:ring-secondary-500 text-white border-transparent";
        case "success":
          return "bg-success-500 hover:bg-success-600 focus:ring-success-500 text-white border-transparent";
        case "warning":
          return "bg-warning-500 hover:bg-warning-600 focus:ring-warning-500 text-white border-transparent";
        case "danger":
          return "bg-accent-500 hover:bg-accent-600 focus:ring-accent-500 text-white border-transparent";
        case "info":
          return "bg-info-500 hover:bg-info-600 focus:ring-info-500 text-white border-transparent";
        case "neutral":
          return "bg-white hover:bg-neutral-50 focus:ring-neutral-500 text-neutral-700 border-neutral-300";
        default:
          return "bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 text-white border-transparent";
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case "xs":
          return "px-2.5 py-1.5 text-xs";
        case "sm":
          return "px-3 py-2 text-sm";
        case "md":
          return "px-4 py-2 text-sm";
        case "lg":
          return "px-4 py-2 text-base";
        case "xl":
          return "px-6 py-3 text-base";
        default:
          return "px-4 py-2 text-sm";
      }
    };

    const getRoundedClasses = () => {
      switch (rounded) {
        case "none":
          return "rounded-none";
        case "sm":
          return "rounded-sm";
        case "md":
          return "rounded-md";
        case "lg":
          return "rounded-lg";
        case "full":
          return "rounded-full";
        default:
          return "rounded-md";
      }
    };

    const LoadingSpinner = () => (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
    );

    const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    border
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${getRoundedClasses()}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
      .trim()
      .replace(/\s+/g, " ");

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

// Pre-configured button variants for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="primary" {...props} />;

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="neutral" {...props} />;

export const SuccessButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="success" {...props} />;

export const DangerButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="danger" {...props} />
);

export const InfoButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="info" {...props} />
);
