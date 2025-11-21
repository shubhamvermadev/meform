"use client";

import { Card } from "@meform/ui";
import { UI_LABELS } from "@meform/config";
import { useAppContext } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@meform/config";
import { ApplicationStatusCard } from "@/components/applications/ApplicationStatusCard";
import { ApplicationSecretCard } from "@/components/applications/ApplicationSecretCard";
import { ApplicationDangerZone } from "@/components/applications/ApplicationDangerZone";
import type { ApplicationResponse } from "@meform/dto";

async function fetchApplication(appId: string): Promise<ApplicationResponse> {
  const res = await fetch(ROUTES.API.APPLICATION(appId), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch application");
  }
  return res.json();
}

export default function SettingsPage() {
  const { selectedAppId } = useAppContext();

  const { data: application, isLoading } = useQuery({
    queryKey: ["app", selectedAppId],
    queryFn: () => fetchApplication(selectedAppId),
    enabled: !!selectedAppId,
  });

  if (!selectedAppId) {
    return (
      <Card title={UI_LABELS.SETTINGS}>
        <div className="text-center py-8 text-gray">
          Please select an application first
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title={UI_LABELS.SETTINGS}>
        <div className="text-center py-8 text-gray">Loading...</div>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card title={UI_LABELS.SETTINGS}>
        <div className="text-center py-8 text-gray">Application not found</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationSecretCard applicationId={application.id} />
      <ApplicationStatusCard application={application} />
      <ApplicationDangerZone application={application} />
    </div>
  );
}

