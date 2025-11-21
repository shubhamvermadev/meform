import React from "react";

export interface CardProps {
  title?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Reusable Card component
 */
export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerActions,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-lightGray ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-lightGray flex items-center justify-between">
          {typeof title === "string" ? (
            <h2 className="text-base font-medium text-dark">{title}</h2>
          ) : (
            <div className="flex items-center">{title}</div>
          )}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

