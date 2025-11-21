import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * Reusable Select component
 */
export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
          error ? "border-red-500" : "border-lightGray"
        } text-sm bg-white ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-gray">
          {helperText}
        </p>
      )}
    </div>
  );
};



