"use client";

import { useState } from "react";
import { Card, Button, Modal, TextInput } from "@meform/ui";
import { UI_LABELS } from "@meform/config";
import { useDeleteApplication } from "@/hooks/use-applications";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { ROUTES } from "@meform/config";
import type { ApplicationResponse } from "@meform/dto";

interface ApplicationDangerZoneProps {
  application: ApplicationResponse;
}

export function ApplicationDangerZone({ application }: ApplicationDangerZoneProps) {
  const router = useRouter();
  const { setSelectedAppId } = useAppContext();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const deleteMutation = useDeleteApplication();

  const handleDelete = async () => {
    if (confirmName !== application.name) {
      return;
    }
    try {
      await deleteMutation.mutateAsync({ appId: application.id, hard: true });
      setSelectedAppId("");
      router.push(ROUTES.DASHBOARD.HOME);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleteDialogOpen(false);
      setConfirmName("");
    }
  };

  const canDelete = confirmName === application.name;

  return (
    <>
      <Card title={UI_LABELS.DANGER_ZONE}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-dark mb-1">{UI_LABELS.DELETE_APPLICATION}</h3>
            <p className="text-sm text-gray mb-4">
              {UI_LABELS.CONFIRM_DELETE_APP}
            </p>
            <Button
              variant="danger"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              {UI_LABELS.DELETE_APPLICATION}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={isDeleteDialogOpen}
        title={UI_LABELS.DELETE_APPLICATION}
        description={UI_LABELS.CONFIRM_DELETE_APP}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setConfirmName("");
        }}
        primaryAction={{
          label: UI_LABELS.DELETE,
          onClick: handleDelete,
          disabled: !canDelete,
          isLoading: deleteMutation.isPending,
        }}
        secondaryAction={{
          label: UI_LABELS.CANCEL,
          onClick: () => {
            setIsDeleteDialogOpen(false);
            setConfirmName("");
          },
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray">{UI_LABELS.CONFIRM_DELETE_APP_NAME}</p>
          <TextInput
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={application.name}
            autoFocus
          />
          <p className="text-xs text-gray">
            Type <strong>{application.name}</strong> to confirm
          </p>
        </div>
      </Modal>
    </>
  );
}

