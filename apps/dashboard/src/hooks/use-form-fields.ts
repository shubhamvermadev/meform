import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES, UI_LABELS } from "@meform/config";
import toast from "react-hot-toast";
import type {
  FormFieldResponse,
  CreateFormFieldRequest,
  UpdateFormFieldRequest,
} from "@meform/dto";

const queryKeys = {
  all: (appId: string, formId: string) => ["fields", appId, formId] as const,
  list: (appId: string, formId: string) => [...queryKeys.all(appId, formId)] as const,
};

async function fetchFormFields(appId: string, formId: string): Promise<FormFieldResponse[]> {
  const res = await fetch(ROUTES.API.FIELDS(appId, formId), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch form fields");
  }
  return res.json();
}

async function createFormField(
  appId: string,
  formId: string,
  data: CreateFormFieldRequest
): Promise<FormFieldResponse> {
  const res = await fetch(ROUTES.API.FIELDS(appId, formId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create field");
  }
  return res.json();
}

async function updateFormField(
  appId: string,
  formId: string,
  fieldId: string,
  data: UpdateFormFieldRequest
): Promise<FormFieldResponse> {
  const res = await fetch(ROUTES.API.FIELD(appId, formId, fieldId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update field");
  }
  return res.json();
}

async function deleteFormField(appId: string, formId: string, fieldId: string): Promise<void> {
  const res = await fetch(ROUTES.API.FIELD(appId, formId, fieldId), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete field");
  }
}

export function useFormFields(appId: string, formId: string) {
  return useQuery({
    queryKey: queryKeys.list(appId, formId),
    queryFn: () => fetchFormFields(appId, formId),
    enabled: !!appId && !!formId,
  });
}

export function useCreateFormField(appId: string, formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormFieldRequest) => createFormField(appId, formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId, formId) });
      toast.success(UI_LABELS.FIELD_ADDED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFormField(appId: string, formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, data }: { fieldId: string; data: UpdateFormFieldRequest }) =>
      updateFormField(appId, formId, fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId, formId) });
      toast.success(UI_LABELS.FIELD_UPDATED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFormField(appId: string, formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) => deleteFormField(appId, formId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId, formId) });
      toast.success(UI_LABELS.FIELD_DELETED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}




