"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useApplications } from "@/hooks/use-applications";

interface AppContextType {
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: applications } = useApplications();
  const [selectedAppId, setSelectedAppId] = useState<string>("");

  useEffect(() => {
    if (applications && applications.length > 0 && !selectedAppId) {
      setSelectedAppId(applications[0].id);
    }
  }, [applications, selectedAppId]);

  // Memoize setSelectedAppId to prevent unnecessary re-renders
  const handleSetSelectedAppId = useCallback((id: string) => {
    setSelectedAppId(id);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      selectedAppId,
      setSelectedAppId: handleSetSelectedAppId,
    }),
    [selectedAppId, handleSetSelectedAppId]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}



