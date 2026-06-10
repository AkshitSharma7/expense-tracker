import { useActor } from "@/hooks/useBackendActor";
import type { Expense, ExpenseInput, Budget, BudgetInput, CategorySummary } from "@/types";

// Re-export types for convenience
export type { Expense, ExpenseInput, Budget, BudgetInput, CategorySummary };

// useActor hook returns { actor, isFetching }
// All calls go through actor methods directly

export async function callAddExpense(
  actor: ReturnType<typeof useActor>["actor"],
  input: ExpenseInput
): Promise<bigint> {
  if (!actor) throw new Error("Actor not available");
  return actor.addExpense(input);
}

export async function callGetExpenses(
  actor: ReturnType<typeof useActor>["actor"]
): Promise<Expense[]> {
  if (!actor) return [];
  return actor.getExpenses();
}

export async function callUpdateExpense(
  actor: ReturnType<typeof useActor>["actor"],
  id: bigint,
  input: ExpenseInput
): Promise<boolean> {
  if (!actor) throw new Error("Actor not available");
  return actor.updateExpense(id, input);
}

export async function callDeleteExpense(
  actor: ReturnType<typeof useActor>["actor"],
  id: bigint
): Promise<boolean> {
  if (!actor) throw new Error("Actor not available");
  return actor.deleteExpense(id);
}

export async function callGetBudgets(
  actor: ReturnType<typeof useActor>["actor"]
): Promise<Budget[]> {
  if (!actor) return [];
  return actor.getBudgets();
}

export async function callSetBudget(
  actor: ReturnType<typeof useActor>["actor"],
  input: BudgetInput
): Promise<void> {
  if (!actor) throw new Error("Actor not available");
  return actor.setBudget(input);
}

export async function callGetMonthlySummary(
  actor: ReturnType<typeof useActor>["actor"],
  year: number,
  month: number
): Promise<CategorySummary[]> {
  if (!actor) return [];
  return actor.getMonthlySummary(BigInt(year), BigInt(month));
}

export async function callGetTodaySpending(
  actor: ReturnType<typeof useActor>["actor"]
): Promise<number> {
  if (!actor) return 0;
  return actor.getTodaySpending();
}

export async function callSeedSampleData(
  actor: ReturnType<typeof useActor>["actor"]
): Promise<void> {
  if (!actor) return;
  return actor.seedSampleData();
}
