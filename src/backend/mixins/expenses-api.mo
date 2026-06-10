import Types "../types/expenses";
import ExpenseLib "../lib/expenses";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

mixin (
  expenses : List.List<Types.Expense>,
  budgets : Map.Map<Text, Types.Budget>,
) {
  var nextExpenseId : Nat = 1;
  var nextBudgetId : Nat = 1;

  // Derive today's date string YYYY-MM-DD from Time.now()
  func todayText() : Text {
    let ns : Int = Time.now();
    let seconds : Int = ns / 1_000_000_000;
    let days : Int = seconds / 86400;
    // Days since Unix epoch (1970-01-01) to Gregorian calendar
    // Using algorithm from https://www.researchgate.net/publication/316558298
    let z : Int = days + 719468;
    let era : Int = (if (z >= 0) z else z - 146096) / 146097;
    let doe : Int = z - era * 146097;
    let yoe : Int = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y : Int = yoe + era * 400;
    let doy : Int = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp : Int = (5 * doy + 2) / 153;
    let d : Int = doy - (153 * mp + 2) / 5 + 1;
    let m : Int = if (mp < 10) mp + 3 else mp - 9;
    let yr : Int = if (m <= 2) y + 1 else y;
    let yearN : Nat = Int.abs(yr);
    let monthN : Nat = Int.abs(m);
    let dayN : Nat = Int.abs(d);
    yearN.toText() # "-"
      # (if (monthN < 10) "0" else "") # monthN.toText() # "-"
      # (if (dayN < 10) "0" else "") # dayN.toText();
  };

  /// Add a new expense and return its assigned id.
  public func addExpense(input : Types.ExpenseInput) : async Nat {
    let id = ExpenseLib.addExpense(expenses, nextExpenseId, input, todayText());
    nextExpenseId := nextExpenseId + 1;
    id;
  };

  /// Return all stored expenses.
  public query func getExpenses() : async [Types.Expense] {
    ExpenseLib.getExpenses(expenses);
  };

  /// Update an existing expense. Returns true on success.
  public func updateExpense(id : Nat, input : Types.ExpenseInput) : async Bool {
    ExpenseLib.updateExpense(expenses, id, input);
  };

  /// Delete an expense by id. Returns true on success.
  public func deleteExpense(id : Nat) : async Bool {
    ExpenseLib.deleteExpense(expenses, id);
  };

  /// Return all budget entries.
  public query func getBudgets() : async [Types.Budget] {
    ExpenseLib.getBudgets(budgets);
  };

  /// Set (insert or update) the monthly budget limit for a category.
  public func setBudget(input : Types.BudgetInput) : async () {
    let newId = ExpenseLib.setBudget(budgets, nextBudgetId, input);
    if (newId == nextBudgetId) {
      nextBudgetId := nextBudgetId + 1;
    };
  };

  /// Return per-category spending totals for the given year/month.
  public query func getMonthlySummary(year : Nat, month : Nat) : async [Types.CategorySummary] {
    ExpenseLib.getMonthlySummary(expenses, year, month);
  };

  /// Return total spending recorded for today's date.
  public query func getTodaySpending() : async Float {
    ExpenseLib.getTodaySpending(expenses, todayText());
  };

  /// Seed sample data on first run (no-op if expenses already exist).
  public func seedSampleData() : async () {
    let newNextId = ExpenseLib.seedSampleData(expenses, nextExpenseId, todayText());
    nextExpenseId := newNextId;
  };
};
