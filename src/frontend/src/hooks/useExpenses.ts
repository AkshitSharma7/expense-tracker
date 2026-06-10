import { useActor } from "@/hooks/useBackendActor";
import {
  callAddExpense,
  callDeleteExpense,
  callGetBudgets,
  callGetExpenses,
  callGetMonthlySummary,
  callGetTodaySpending,
  callSetBudget,
  callUpdateExpense,
} from "@/lib/backend";
import type { BudgetInput, ExpenseInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEYS = {
  expenses: ["expenses"] as const,
  budgets: ["budgets"] as const,
  monthlySummary: (year: number, month: number) =>
    ["monthlySummary", year, month] as const,
  todaySpending: ["todaySpending"] as const,
};

export function useExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.expenses,
    queryFn: () => callGetExpenses(actor),
    enabled: !!actor && !isFetching,
  });
}

export function useBudgets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.budgets,
    queryFn: () => callGetBudgets(actor),
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlySummary(year: number, month: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.monthlySummary(year, month),
    queryFn: () => callGetMonthlySummary(actor, year, month),
    enabled: !!actor && !isFetching,
  });
}

export function useTodaySpending() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: QUERY_KEYS.todaySpending,
    queryFn: () => callGetTodaySpending(actor),
    enabled: !!actor && !isFetching,
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExpenseInput) => callAddExpense(actor, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todaySpending });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: bigint; input: ExpenseInput }) =>
      callUpdateExpense(actor, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todaySpending });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => callDeleteExpense(actor, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todaySpending });
      queryClient.invalidateQueries({ queryKey: ["monthlySummary"] });
    },
  });
}

export function useSetBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BudgetInput) => callSetBudget(actor, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.budgets });
    },
  });
}
