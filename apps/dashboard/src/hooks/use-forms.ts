import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES, UI_LABELS } from "@meform/config";
import toast from "react-hot-toast";
import type {
  FormResponse,
  CreateFormRequest,
  UpdateFormRequest,
} from "@meform/dto";

const queryKeys = {
  all: (appId: string) => ["forms", appId] as const,
  list: (appId: string) => [...queryKeys.all(appId)] as const,
  detail: (appId: string, formId: string) => [...queryKeys.all(appId), formId] as const,
};

async function fetchForms(appId: string): Promise<(FormResponse & { _count?: { fields: number } })[]> {
  const res = await fetch(ROUTES.API.FORMS(appId), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch forms");
  }
  return res.json();
}

async function fetchForm(appId: string, formId: string): Promise<FormResponse> {
  const res = await fetch(ROUTES.API.FORM(appId, formId), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch form");
  }
  return res.json();
}

async function createForm(appId: string, data: CreateFormRequest): Promise<FormResponse> {
  const res = await fetch(ROUTES.API.FORMS(appId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create form");
  }
  return res.json();
}

async function updateForm(
  appId: string,
  formId: string,
  data: UpdateFormRequest
): Promise<FormResponse> {
  const res = await fetch(ROUTES.API.FORM(appId, formId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update form");
  }
  return res.json();
}

async function deleteForm(appId: string, formId: string): Promise<void> {
  const res = await fetch(ROUTES.API.FORM(appId, formId), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete form");
  }
}

export function useForms(appId: string) {
  return useQuery({
    queryKey: queryKeys.list(appId),
    queryFn: () => fetchForms(appId),
    enabled: !!appId,
  });
}

export function useForm(appId: string, formId: string) {
  return useQuery({
    queryKey: queryKeys.detail(appId, formId),
    queryFn: () => fetchForm(appId, formId),
    enabled: !!appId && !!formId,
  });
}

export function useCreateForm(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequest) => createForm(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      toast.success(UI_LABELS.FORM_ADDED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateForm(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: UpdateFormRequest }) =>
      updateForm(appId, formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(appId, variables.formId) });
      toast.success(UI_LABELS.FORM_UPDATED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteForm(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => deleteForm(appId, formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      toast.success(UI_LABELS.FORM_DELETED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

