import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable Checkbox component
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <div className="flex items-start">
        <input
          id={checkboxId}
          type="checkbox"
          className={`mt-0.5 h-4 w-4 text-accent focus:ring-accent border-lightGray rounded ${
            error ? "border-red-500" : ""
          } ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${checkboxId}-helper`} className="mt-1.5 text-xs text-gray">
          {helperText}
        </p>
      )}
    </div>
  );
};



