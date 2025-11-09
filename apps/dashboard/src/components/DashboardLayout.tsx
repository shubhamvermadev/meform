"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ROUTES, UI_LABELS } from "@meform/config";
import { Button } from "@meform/ui";
import { FiLink, FiFileText, FiCode, FiMessageSquare, FiSettings } from "react-icons/fi";
import { useApplications } from "@/hooks/use-applications";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { ApplicationCreateDialog } from "./applications/ApplicationCreateDialog";
import type { TApplicationResponse } from "@meform/dto";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: applications = [] } = useApplications();
  const { selectedAppId, setSelectedAppId } = useAppContext();

  const menuItems = [
    { path: ROUTES.DASHBOARD.URLS, label: "URL", icon: FiLink },
    { path: ROUTES.DASHBOARD.FORMS, label: "Forms", icon: FiFileText },
    { path: ROUTES.DASHBOARD.SCRIPTS, label: "Scripts", icon: FiCode },
    { path: ROUTES.DASHBOARD.RESPONSES, label: "Visitor Responses", icon: FiMessageSquare },
    { path: ROUTES.DASHBOARD.SETTINGS, label: "Settings", icon: FiSettings },
  ];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleLogout = async () => {
    await fetch(ROUTES.AUTH.LOGOUT, {
      method: "POST",
      credentials: "include",
    });
    router.push(ROUTES.AUTH.LOGIN);
  };

  const handleApplicationCreated = (app: TApplicationResponse) => {
    setSelectedAppId(app.id);
    if (pathname !== ROUTES.DASHBOARD.HOME) {
      router.push(ROUTES.DASHBOARD.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-backgroundSoft">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-dark">meform</div>
        <div className="flex items-center gap-4">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            {UI_LABELS.CREATE_APPLICATION}
          </Button>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[350px] bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              if (!selectedAppId && item.path.includes("settings")) {
                return null; // Hide settings if no app selected
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
      <ApplicationCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreated={handleApplicationCreated}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AppProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AppProvider>
  );
}
