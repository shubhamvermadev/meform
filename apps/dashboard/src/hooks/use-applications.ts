import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES, UI_LABELS } from "@meform/config";
import toast from "react-hot-toast";
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
} from "@meform/dto";

const queryKeys = {
  all: ["apps"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: () => [...queryKeys.lists()] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

async function fetchApplications(): Promise<ApplicationResponse[]> {
  const res = await fetch(ROUTES.API.APPLICATIONS, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch applications");
  }
  const data = await res.json();
  // Handle response format: { items: [...] }
  return Array.isArray(data) ? data : (data.items || []);
}

async function createApplication(data: CreateApplicationRequest): Promise<ApplicationResponse> {
  const res = await fetch(ROUTES.API.APPLICATIONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create application");
  }
  const response = await res.json();
  return response;
}

async function updateApplication(
  appId: string,
  data: UpdateApplicationRequest
): Promise<ApplicationResponse> {
  const res = await fetch(ROUTES.API.APPLICATION(appId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update application");
  }
  return res.json();
}

async function deleteApplication(appId: string): Promise<void> {
  const res = await fetch(ROUTES.API.APPLICATION(appId), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete application");
  }
}

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.list(),
    queryFn: fetchApplications,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      toast.success(UI_LABELS.APP_CREATED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data: UpdateApplicationRequest }) =>
      updateApplication(appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.appId) });
      toast.success(UI_LABELS.APP_UPDATED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      toast.success(UI_LABELS.APP_DELETED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

