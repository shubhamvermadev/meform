"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@meform/ui";
import { UI_LABELS, UI_DESCRIPTIONS, ROUTES } from "@meform/config";
import { useApplications } from "@/hooks/use-applications";
import { ApplicationCreateDialog } from "@/components/applications/ApplicationCreateDialog";
import { useAppContext } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import type { TApplicationResponse } from "@meform/dto";

export default function DashboardPage() {
  const router = useRouter();
  const { data: applications = [], isLoading } = useApplications();
  const { setSelectedAppId } = useAppContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleApplicationCreated = (app: TApplicationResponse) => {
    setSelectedAppId(app.id);
    router.push(ROUTES.DASHBOARD.URLS);
  };

  // Redirect if applications exist
  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      router.push(ROUTES.DASHBOARD.URLS);
    }
  }, [isLoading, applications.length, router]);

  if (isLoading) {
    return (
      <Card title="Dashboard">
        <div className="text-center py-8 text-gray">Loading...</div>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <>
        <Card title="Dashboard">
          <div className="text-center py-16">
            <p className="text-gray mb-6 text-lg">
              {UI_DESCRIPTIONS.EMPTY_STATE_MESSAGE}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              {UI_LABELS.CREATE_NEW_APPLICATION}
            </Button>
          </div>
        </Card>
        <ApplicationCreateDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreated={handleApplicationCreated}
        />
      </>
    );
  }

  return null;
}
