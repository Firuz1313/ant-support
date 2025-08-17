import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sessionsApi,
  SessionFilters,
  SessionCreateData,
  SessionUpdateData,
} from "../api";
import { DiagnosticSession } from "../types";

// Query keys
export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (filters: SessionFilters) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string, includeProgress?: boolean) =>
    [...sessionKeys.details(), id, includeProgress] as const,
  active: () => [...sessionKeys.all, "active"] as const,
  stats: () => [...sessionKeys.all, "stats"] as const,
  analytics: (period: string, limit: number) =>
    [...sessionKeys.all, "analytics", period, limit] as const,
  popular: (limit: number, timeframe: string) =>
    [...sessionKeys.all, "popular", limit, timeframe] as const,
};

// Hooks for querying sessions
export const useSessions = (
  page: number = 1,
  limit: number = 20,
  filters: SessionFilters = {},
) => {
  return useQuery({
    queryKey: sessionKeys.list({ page, limit, ...filters }),
    queryFn: () => sessionsApi.getSessions(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSession = (id: string, includeProgress: boolean = false) => {
  return useQuery({
    queryKey: sessionKeys.detail(id, includeProgress),
    queryFn: () => sessionsApi.getSession(id, includeProgress),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useActiveSessions = (limit: number = 50, offset: number = 0) => {
  return useQuery({
    queryKey: [...sessionKeys.active(), limit, offset],
    queryFn: () => sessionsApi.getActiveSessions(limit, offset),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useSessionStats = (
  filters: {
    deviceId?: string;
    problemId?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
) => {
  return useQuery({
    queryKey: [...sessionKeys.stats(), filters],
    queryFn: () => sessionsApi.getSessionStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePopularProblems = (
  limit: number = 10,
  timeframe: string = "30 days",
) => {
  return useQuery({
    queryKey: sessionKeys.popular(limit, timeframe),
    queryFn: () => sessionsApi.getPopularProblems(limit, timeframe),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTimeAnalytics = (
  period: "hour" | "day" | "week" | "month" = "day",
  limit: number = 30,
) => {
  return useQuery({
    queryKey: sessionKeys.analytics(period, limit),
    queryFn: () => sessionsApi.getTimeAnalytics(period, limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation hooks
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SessionCreateData) => sessionsApi.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionUpdateData }) =>
      sessionsApi.updateSession(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      sessionsApi.completeSession(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false }: { id: string; force?: boolean }) =>
      sessionsApi.deleteSession(id, force),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.removeQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
};

export const useRestoreSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsApi.restoreSession(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
};

export const useCleanupOldSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (daysToKeep: number = 90) =>
      sessionsApi.cleanupOldSessions(daysToKeep),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
};

export const useExportSessions = () => {
  return useMutation({
    mutationFn: ({
      format = "json",
      filters = {},
    }: {
      format?: string;
      filters?: any;
    }) => sessionsApi.exportSessions(format, filters),
  });
};

export default {
  useSessions,
  useSession,
  useActiveSessions,
  useSessionStats,
  usePopularProblems,
  useTimeAnalytics,
  useCreateSession,
  useUpdateSession,
  useCompleteSession,
  useDeleteSession,
  useRestoreSession,
  useCleanupOldSessions,
  useExportSessions,
};
