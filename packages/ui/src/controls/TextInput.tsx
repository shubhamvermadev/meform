import React from "react";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable TextInput component
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
          error ? "border-red-500" : "border-lightGray"
        } text-sm ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-gray">
          {helperText}
        </p>
      )}
    </div>
  );
};



