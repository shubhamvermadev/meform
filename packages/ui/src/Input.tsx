import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable Input component
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm ${
          error ? "border-red-500" : "border-lightGray"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

