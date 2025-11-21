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
    primary: "bg-accent hover:bg-[#1557b0] text-white focus:ring-accent shadow-sm",
    secondary: "bg-white hover:bg-hoverGray text-gray border border-lightGray focus:ring-accent",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 shadow-sm",
    iconButton: "bg-transparent hover:bg-hoverGray text-gray focus:ring-gray-300 rounded-full",
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

