import React from "react";
import { PALETTE } from "@meform/config";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "iconButton";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

/**
 * Reusable Button component
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-[#ff4000] hover:bg-[#faaa8d] text-white focus:ring-[#ff4000]",
    secondary: "bg-[#50b2c0] hover:bg-[#3a9fb0] text-white focus:ring-[#50b2c0]",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600",
    iconButton: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 rounded-md",
  };

  const sizeStyles = {
    sm: variant === "iconButton" ? "p-1.5" : "px-3 py-1.5 text-sm",
    md: variant === "iconButton" ? "p-2" : "px-4 py-2 text-base",
    lg: variant === "iconButton" ? "p-3" : "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

