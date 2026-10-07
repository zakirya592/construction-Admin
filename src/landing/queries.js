import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "@/utils/userRequest";

export const landingKeys = {
  all: ["landing-page"],
  section: (sectionKey) => ["landing-page", sectionKey],
};

function assertOk(response, fallback) {
  if (response.data?.status === false) {
    const error = new Error(response.data?.message || fallback);
    error.response = response;
    throw error;
  }
  return response.data;
}

export function useLandingSections() {
  return useQuery({
    queryKey: landingKeys.all,
    queryFn: async () => {
      const response = await newRequest.get("/api/landing-page");
      const body = assertOk(response, "Could not load sections");
      return body?.data ?? [];
    },
  });
}

export function useLandingSection(sectionKey, { enabled = true } = {}) {
  return useQuery({
    queryKey: landingKeys.section(sectionKey),
    enabled: Boolean(sectionKey) && enabled,
    queryFn: async () => {
      const response = await newRequest.get(`/api/landing-page/${sectionKey}`);
      const body = assertOk(response, "Could not load this section");
      return body?.data ?? null;
    },
  });
}

export function useSaveLandingSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, body, create }) => {
      const response = create
        ? await newRequest.post("/api/landing-page", body)
        : await newRequest.put(`/api/landing-page/${sectionKey}`, body);
      return assertOk(response, "Could not save this section");
    },
    onSuccess: (_data, { sectionKey }) => {
      queryClient.invalidateQueries({ queryKey: landingKeys.all });
      queryClient.invalidateQueries({ queryKey: landingKeys.section(sectionKey) });
    },
  });
}

export function useLandingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionKey, isActive }) => {
      const response = await newRequest.patch(`/api/landing-page/${sectionKey}/status`, { isActive });
      return assertOk(response, "Could not update status");
    },
    onSuccess: (body, { sectionKey }) => {
      const data = body?.data;
      if (data && typeof data === "object" && data.sectionKey) {
        queryClient.setQueryData(landingKeys.section(sectionKey), data);
      } else {
        queryClient.invalidateQueries({ queryKey: landingKeys.section(sectionKey) });
      }
    },
  });
}

export function useDeleteLandingSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionKey) => {
      const response = await newRequest.delete(`/api/landing-page/${sectionKey}`);
      return assertOk(response, "Could not delete this section");
    },
    onSuccess: (_body, sectionKey) => {
      queryClient.setQueryData(landingKeys.section(sectionKey), null);
      queryClient.invalidateQueries({ queryKey: landingKeys.all });
    },
  });
}
