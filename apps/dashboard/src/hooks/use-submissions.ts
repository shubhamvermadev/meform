import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@meform/config";
import type { ListSubmissionsResponse, ListSubmissionsQuery } from "@meform/dto";

const queryKeys = {
  all: (appId: string) => ["submissions", appId] as const,
  list: (appId: string, params: ListSubmissionsQuery) => [...queryKeys.all(appId), params] as const,
};

async function fetchSubmissions(
  appId: string,
  params: ListSubmissionsQuery
): Promise<ListSubmissionsResponse> {
  const url = new URL(ROUTES.API.SUBMISSIONS(appId), window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch submissions");
  }
  return res.json();
}

export function useSubmissions(appId: string, params: ListSubmissionsQuery) {
  return useQuery({
    queryKey: queryKeys.list(appId, params),
    queryFn: () => fetchSubmissions(appId, params),
    enabled: !!appId,
  });
}




