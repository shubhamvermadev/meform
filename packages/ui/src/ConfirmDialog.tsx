import React from "react";
import { Modal, ModalProps } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
}

/**
 * Confirmation dialog for destructive actions
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger",
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        isLoading,
        disabled: isLoading,
      }}
      secondaryAction={{
        label: cancelLabel,
        onClick: onClose,
        variant: "outline",
      }}
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

