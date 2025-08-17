import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stepsApi, StepFilters, StepCreateData, StepUpdateData } from '../api';
import { Step } from '../types';

// Query keys
export const stepKeys = {
  all: ['steps'] as const,
  lists: () => [...stepKeys.all, 'list'] as const,
  list: (filters: StepFilters) => [...stepKeys.lists(), filters] as const,
  details: () => [...stepKeys.all, 'detail'] as const,
  detail: (id: string, includeDetails?: boolean, includeStats?: boolean) => 
    [...stepKeys.details(), id, includeDetails, includeStats] as const,
  search: (query: string) => [...stepKeys.all, 'search', query] as const,
  byProblem: (problemId: string, isActive?: boolean) => 
    [...stepKeys.all, 'byProblem', problemId, isActive] as const,
  stats: (id: string) => [...stepKeys.all, 'stats', id] as const,
  validate: (problemId: string) => [...stepKeys.all, 'validate', problemId] as const,
};

// Hooks for querying steps
export const useSteps = (
  page: number = 1,
  limit: number = 20,
  filters: StepFilters = {}
) => {
  return useQuery({
    queryKey: stepKeys.list({ page, limit, ...filters }),
    queryFn: () => stepsApi.getSteps(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStep = (
  id: string,
  includeDetails: boolean = false,
  includeStats: boolean = false
) => {
  return useQuery({
    queryKey: stepKeys.detail(id, includeDetails, includeStats),
    queryFn: () => stepsApi.getStep(id, includeDetails, includeStats),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStepSearch = (query: string, limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: stepKeys.search(`${query}-${limit}-${offset}`),
    queryFn: () => stepsApi.searchSteps(query, limit, offset),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useStepsByProblem = (problemId: string, isActive: boolean = true) => {
  return useQuery({
    queryKey: stepKeys.byProblem(problemId, isActive),
    queryFn: () => stepsApi.getStepsByProblem(problemId, isActive),
    enabled: !!problemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStepStats = (id: string) => {
  return useQuery({
    queryKey: stepKeys.stats(id),
    queryFn: () => stepsApi.getStepStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useValidateStepOrder = (problemId: string) => {
  return useQuery({
    queryKey: stepKeys.validate(problemId),
    queryFn: () => stepsApi.validateStepOrder(problemId),
    enabled: !!problemId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Mutation hooks
export const useCreateStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StepCreateData) => stepsApi.createStep(data),
    onSuccess: (response, data) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(data.problemId) });
      queryClient.invalidateQueries({ queryKey: stepKeys.validate(data.problemId) });
    },
  });
};

export const useUpdateStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StepUpdateData }) =>
      stepsApi.updateStep(id, data),
    onSuccess: (response, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.detail(id) });
      if (data.problemId) {
        queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(data.problemId) });
        queryClient.invalidateQueries({ queryKey: stepKeys.validate(data.problemId) });
      }
    },
  });
};

export const useDeleteStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false, reorder = true }: { 
      id: string; 
      force?: boolean; 
      reorder?: boolean; 
    }) => stepsApi.deleteStep(id, force, reorder),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.removeQueries({ queryKey: stepKeys.detail(id) });
      // Since we don't know the problemId, invalidate all byProblem queries
      queryClient.invalidateQueries({ queryKey: stepKeys.all });
    },
  });
};

export const useRestoreStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stepsApi.restoreStep(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.detail(id) });
    },
  });
};

export const useReorderSteps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ problemId, stepIds }: { problemId: string; stepIds: string[] }) =>
      stepsApi.reorderSteps(problemId, stepIds),
    onSuccess: (response, { problemId }) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(problemId) });
      queryClient.invalidateQueries({ queryKey: stepKeys.validate(problemId) });
    },
  });
};

export const useInsertStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      problemId, 
      afterStepNumber, 
      stepData 
    }: { 
      problemId: string; 
      afterStepNumber: number; 
      stepData: Omit<StepCreateData, 'problemId'>; 
    }) => stepsApi.insertStep(problemId, afterStepNumber, stepData),
    onSuccess: (response, { problemId }) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(problemId) });
      queryClient.invalidateQueries({ queryKey: stepKeys.validate(problemId) });
    },
  });
};

export const useDuplicateStep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetProblemId }: { id: string; targetProblemId?: string }) =>
      stepsApi.duplicateStep(id, targetProblemId),
    onSuccess: (response, { targetProblemId }) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      if (targetProblemId) {
        queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(targetProblemId) });
        queryClient.invalidateQueries({ queryKey: stepKeys.validate(targetProblemId) });
      }
    },
  });
};

export const useFixStepNumbering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (problemId: string) => stepsApi.fixStepNumbering(problemId),
    onSuccess: (response, problemId) => {
      queryClient.invalidateQueries({ queryKey: stepKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stepKeys.byProblem(problemId) });
      queryClient.invalidateQueries({ queryKey: stepKeys.validate(problemId) });
    },
  });
};

// Navigation hooks
export const useNextStep = (id: string) => {
  return useQuery({
    queryKey: [...stepKeys.detail(id), 'next'],
    queryFn: () => stepsApi.getNextStep(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePreviousStep = (id: string) => {
  return useQuery({
    queryKey: [...stepKeys.detail(id), 'previous'],
    queryFn: () => stepsApi.getPreviousStep(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Prefetch helper
export const usePrefetchStep = () => {
  const queryClient = useQueryClient();

  return (id: string, includeDetails: boolean = false, includeStats: boolean = false) => {
    queryClient.prefetchQuery({
      queryKey: stepKeys.detail(id, includeDetails, includeStats),
      queryFn: () => stepsApi.getStep(id, includeDetails, includeStats),
      staleTime: 2 * 60 * 1000,
    });
  };
};

// Optimistic update helper
export const useOptimisticStepUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updateData: Partial<Step>) => {
    queryClient.setQueryData(
      stepKeys.detail(id),
      (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: { ...old.data, ...updateData }
        };
      }
    );
  };
};

export default {
  useSteps,
  useStep,
  useStepSearch,
  useStepsByProblem,
  useStepStats,
  useValidateStepOrder,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
  useRestoreStep,
  useReorderSteps,
  useInsertStep,
  useDuplicateStep,
  useFixStepNumbering,
  useNextStep,
  usePreviousStep,
  usePrefetchStep,
  useOptimisticStepUpdate,
};
