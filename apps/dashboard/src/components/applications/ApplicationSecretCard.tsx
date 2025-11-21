"use client";

import { useState } from "react";
import { Card, Button } from "@meform/ui";
import { UI_LABELS } from "@meform/config";
import { useApplicationSecret, useRotateApplicationSecret } from "@/hooks/use-applications";
import { useAppContext } from "@/contexts/AppContext";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiCopy, FiRefreshCw } from "react-icons/fi";

interface ApplicationSecretCardProps {
  applicationId: string;
}

export function ApplicationSecretCard({ applicationId }: ApplicationSecretCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { data: secretData, refetch } = useApplicationSecret(applicationId);
  const rotateMutation = useRotateApplicationSecret(applicationId);

  const handleCopy = () => {
    if (secretData?.integrationSecret) {
      navigator.clipboard.writeText(secretData.integrationSecret);
      toast.success(UI_LABELS.COPIED);
    }
  };

  const handleRotate = async () => {
    try {
      await rotateMutation.mutateAsync();
      toast.success("Integration secret rotated. Please update your Apps Script with the new secret.");
      refetch();
      setIsVisible(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const maskedSecret = secretData?.integrationSecret
    ? secretData.integrationSecret.substring(0, 8) + "•".repeat(32)
    : "Loading...";

  return (
    <Card title="Integration Secret">
      <div className="space-y-4">
        <p className="text-sm text-gray mb-4">
          This secret is used to sign requests to external integrations like Google Sheets. Keep it secure.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-hoverGray border border-lightGray rounded-md font-mono text-sm">
            {isVisible ? secretData?.integrationSecret || "Loading..." : maskedSecret}
          </div>
          <Button
            variant="iconButton"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </Button>
          <Button
            variant="iconButton"
            size="sm"
            onClick={handleCopy}
            disabled={!secretData?.integrationSecret}
            title="Copy"
          >
            <FiCopy className="w-5 h-5" />
          </Button>
          <Button
            variant="iconButton"
            size="sm"
            onClick={handleRotate}
            isLoading={rotateMutation.isPending}
            title="Rotate"
          >
            <FiRefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

