import React from "react";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable TextArea component
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
          error ? "border-red-500" : "border-lightGray"
        } text-sm ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-gray">
          {helperText}
        </p>
      )}
    </div>
  );
};



