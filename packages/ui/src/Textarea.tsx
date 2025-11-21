import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable Textarea component
 */
export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm ${
          error ? "border-red-500" : "border-lightGray"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

