import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES, UI_LABELS } from "@meform/config";
import toast from "react-hot-toast";
import type {
  UrlRuleResponse,
  CreateUrlRuleRequest,
  UpdateUrlRuleRequest,
} from "@meform/dto";

const queryKeys = {
  all: (appId: string) => ["urlRules", appId] as const,
  list: (appId: string) => [...queryKeys.all(appId)] as const,
};

async function fetchUrlRules(appId: string): Promise<UrlRuleResponse[]> {
  const res = await fetch(ROUTES.API.URL_RULES(appId), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch URL rules");
  }
  return res.json();
}

async function createUrlRule(
  appId: string,
  data: CreateUrlRuleRequest
): Promise<UrlRuleResponse> {
  const res = await fetch(ROUTES.API.URL_RULES(appId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create URL rule");
  }
  return res.json();
}

async function updateUrlRule(
  appId: string,
  ruleId: string,
  data: UpdateUrlRuleRequest
): Promise<UrlRuleResponse> {
  const res = await fetch(ROUTES.API.URL_RULE(appId, ruleId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update URL rule");
  }
  return res.json();
}

async function deleteUrlRule(appId: string, ruleId: string): Promise<void> {
  const res = await fetch(ROUTES.API.URL_RULE(appId, ruleId), {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete URL rule");
  }
}

export function useUrlRules(appId: string) {
  return useQuery({
    queryKey: queryKeys.list(appId),
    queryFn: () => fetchUrlRules(appId),
    enabled: !!appId,
  });
}

export function useCreateUrlRule(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUrlRuleRequest) => createUrlRule(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      toast.success(UI_LABELS.URL_ADDED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUrlRule(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: string; data: UpdateUrlRuleRequest }) =>
      updateUrlRule(appId, ruleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      toast.success(UI_LABELS.URL_UPDATED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUrlRule(appId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => deleteUrlRule(appId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list(appId) });
      toast.success(UI_LABELS.URL_DELETED);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

