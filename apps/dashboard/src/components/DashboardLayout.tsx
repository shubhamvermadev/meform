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
    <div className="min-h-screen bg-white">
      {/* Header - Gmail style */}
      <header className="bg-white border-b border-lightGray px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-xl font-medium text-dark">meform</div>
          <div className="h-6 w-px bg-lightGray"></div>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="px-3 py-1.5 border border-lightGray rounded-md text-sm text-gray bg-white hover:bg-hoverGray focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            {UI_LABELS.CREATE_APPLICATION}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Gmail style */}
        <aside className="w-[240px] bg-white border-r border-lightGray min-h-[calc(100vh-49px)]">
          <nav className="p-2">
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
                  className={`flex items-center gap-4 px-3 py-2.5 rounded-r-full transition-colors text-sm ${
                    isActive
                      ? "bg-accentSoft text-accent font-medium"
                      : "text-gray hover:bg-hoverGray"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Gmail style */}
        <main className="flex-1 bg-backgroundSoft min-h-[calc(100vh-49px)] p-6">{children}</main>
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
