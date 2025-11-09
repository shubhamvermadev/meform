"use client";

import { useState, useEffect } from "react";
import { Card } from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS } from "@meform/config";
import { useUpdateApplicationStatus } from "@/hooks/use-applications";
import type { ApplicationResponse } from "@meform/dto";

interface ApplicationStatusCardProps {
  application: ApplicationResponse;
}

export function ApplicationStatusCard({ application: initialApplication }: ApplicationStatusCardProps) {
  const updateMutation = useUpdateApplicationStatus();
  const [application, setApplication] = useState(initialApplication);

  // Update local state when prop changes (after refetch)
  useEffect(() => {
    setApplication(initialApplication);
  }, [initialApplication]);

  const handleStatusToggle = async () => {
    const newStatus = application.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    // Optimistic update
    setApplication({ ...application, status: newStatus });
    await updateMutation.mutateAsync({
      appId: application.id,
      status: newStatus,
    });
  };

  return (
    <Card title={UI_LABELS.APP_STATUS}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{UI_DESCRIPTIONS.APP_STATUS_DISABLED_HELP}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {application.status === "ACTIVE" ? UI_LABELS.APP_STATUS_ACTIVE : UI_LABELS.APP_STATUS_DISABLED}
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={application.status === "ACTIVE"}
              onChange={handleStatusToggle}
              disabled={updateMutation.isPending}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>
      </div>
    </Card>
  );
}

