import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { FiX } from "react-icons/fi";

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "ghost" | "outline";
  };
}

/**
 * Reusable Modal component with focus trap, ESC to close, and click outside to close
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  description,
  onClose,
  children,
  primaryAction,
  secondaryAction,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus trap: focus first input on open
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector(
        "input, textarea, select, [tabindex]:not([tabindex='-1'])"
      ) as HTMLElement | null;
      if (firstInput) {
        firstInput.focus();
        firstInputRef.current = firstInput as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      }
    }, 100);

    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !primaryAction?.isLoading) {
        onClose();
      }
    };

    // Handle Enter key for form submission
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey && primaryAction && !primaryAction.disabled && !primaryAction.isLoading) {
        e.preventDefault();
        primaryAction.onClick();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleEnter);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleEnter);
      document.body.style.overflow = "";

      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [open, onClose, primaryAction]);

  // Focus trap: keep focus within modal
  useEffect(() => {
    if (!open || !modalRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !primaryAction?.isLoading) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-lightGray"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-lightGray flex items-start justify-between">
          <div className="flex-1">
            <h2 id="modal-title" className="text-base font-medium text-dark">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-gray">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="iconButton"
            size="sm"
            onClick={onClose}
            disabled={primaryAction?.isLoading}
            className="ml-4"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {(primaryAction || secondaryAction) && (
          <div className="px-6 py-4 border-t border-lightGray flex items-center justify-end gap-3">
            {secondaryAction && (
              <Button
                variant="secondary"
                onClick={secondaryAction.onClick}
                disabled={primaryAction?.isLoading}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant="primary"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                isLoading={primaryAction.isLoading}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};



