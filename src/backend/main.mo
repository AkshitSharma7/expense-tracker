import Types "types/expenses";
import ExpensesApi "mixins/expenses-api";
import ExpenseLib "lib/expenses";
import List "mo:core/List";
import Map "mo:core/Map";

actor {
  let expenses = List.empty<Types.Expense>();
  let budgets = Map.empty<Text, Types.Budget>();

  include ExpensesApi(expenses, budgets);

  // On first install, seed sample expenses and initialize default budgets.
  // This runs at actor construction time (first deploy).
  do {
    let seededNextId = ExpenseLib.seedSampleData(expenses, nextExpenseId, "2026-04-19");
    nextExpenseId := seededNextId;

    // Initialize default budgets for all 8 categories if none exist.
    if (budgets.isEmpty()) {
      for (cat in Types.DEFAULT_CATEGORIES.values()) {
        let _ = ExpenseLib.setBudget(budgets, nextBudgetId, { category = cat; monthly_limit = 5000.0 });
        nextBudgetId := nextBudgetId + 1;
      };
    };
  };
};
