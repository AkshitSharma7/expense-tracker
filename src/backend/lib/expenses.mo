import Types "../types/expenses";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";

module {
  public type Expense = Types.Expense;
  public type ExpenseInput = Types.ExpenseInput;
  public type Budget = Types.Budget;
  public type BudgetInput = Types.BudgetInput;
  public type CategorySummary = Types.CategorySummary;

  /// Add a new expense. Returns the new expense id.
  public func addExpense(
    expenses : List.List<Expense>,
    nextId : Nat,
    input : ExpenseInput,
    createdAt : Text,
  ) : Nat {
    let expense : Expense = {
      id = nextId;
      title = input.title;
      amount = input.amount;
      category = input.category;
      date = input.date;
      note = input.note;
      payment_method = input.payment_method;
      created_at = createdAt;
    };
    expenses.add(expense);
    nextId;
  };

  /// Return all expenses as an immutable array.
  public func getExpenses(expenses : List.List<Expense>) : [Expense] {
    expenses.toArray();
  };

  /// Update an existing expense by id. Returns true if found and updated.
  public func updateExpense(
    expenses : List.List<Expense>,
    id : Nat,
    input : ExpenseInput,
  ) : Bool {
    var found = false;
    expenses.mapInPlace(
      func(e) {
        if (e.id == id) {
          found := true;
          {
            e with
            title = input.title;
            amount = input.amount;
            category = input.category;
            date = input.date;
            note = input.note;
            payment_method = input.payment_method;
          };
        } else { e };
      }
    );
    found;
  };

  /// Delete an expense by id. Returns true if found and deleted.
  public func deleteExpense(expenses : List.List<Expense>, id : Nat) : Bool {
    let sizeBefore = expenses.size();
    let filtered = expenses.filter(func(e) { e.id != id });
    expenses.clear();
    expenses.append(filtered);
    expenses.size() < sizeBefore;
  };

  /// Return per-category totals for a given year/month (1-indexed month).
  public func getMonthlySummary(
    expenses : List.List<Expense>,
    year : Nat,
    month : Nat,
  ) : [CategorySummary] {
    let prefix = year.toText() # "-" # (if (month < 10) "0" else "") # month.toText();
    let summaryMap = Map.empty<Text, Float>();
    expenses.forEach(func(e) {
      if (e.date.startsWith(#text prefix)) {
        let prev = switch (summaryMap.get(e.category)) {
          case (?v) v;
          case null 0.0;
        };
        summaryMap.add(e.category, prev + e.amount);
      };
    });
    let result = List.empty<CategorySummary>();
    summaryMap.forEach(func(cat, total) {
      result.add({ category = cat; total = total });
    });
    result.toArray();
  };

  /// Return the sum of all expenses recorded on today's date.
  public func getTodaySpending(
    expenses : List.List<Expense>,
    today : Text,
  ) : Float {
    expenses.foldLeft(
      0.0 : Float,
      func(acc : Float, e : Expense) : Float {
        if (e.date == today) acc + e.amount else acc;
      },
    );
  };

  /// Return all budgets as an immutable array.
  public func getBudgets(budgets : Map.Map<Text, Budget>) : [Budget] {
    let result = List.empty<Budget>();
    budgets.forEach(func(_cat, b) { result.add(b) });
    result.toArray();
  };

  /// Set (insert or update) the monthly limit for a category.
  public func setBudget(
    budgets : Map.Map<Text, Budget>,
    nextBudgetId : Nat,
    input : BudgetInput,
  ) : Nat {
    switch (budgets.get(input.category)) {
      case (?existing) {
        budgets.add(input.category, { existing with monthly_limit = input.monthly_limit });
        existing.id;
      };
      case null {
        let budget : Budget = {
          id = nextBudgetId;
          category = input.category;
          monthly_limit = input.monthly_limit;
        };
        budgets.add(input.category, budget);
        nextBudgetId;
      };
    };
  };

  /// Insert 15 realistic sample expenses if the list is empty.
  /// today must be in YYYY-MM-DD format.
  public func seedSampleData(
    expenses : List.List<Expense>,
    nextId : Nat,
    today : Text,
  ) : Nat {
    if (expenses.size() > 0) return nextId;

    // Parse today into year, month, day
    let parts = today.split(#char '-');
    let partsArr = parts.toArray();
    if (partsArr.size() < 3) return nextId;

    let yearOpt = partsArr[0].toNat();
    let monthOpt = partsArr[1].toNat();
    let dayOpt = partsArr[2].toNat();

    let (year, month, day) = switch (yearOpt, monthOpt, dayOpt) {
      case (?y, ?m, ?d) (y, m, d);
      case _ return nextId;
    };

    // Helper to compute a date offset days in the past from today
    // We use a simple approach: subtract days from the day-of-month,
    // wrapping back through months. For simplicity, just keep within
    // last 30 days by adjusting month/day manually.
    func offsetDate(daysAgo : Nat) : Text {
      var d2 = day;
      var m2 = month;
      var y2 = year;
      var remaining = daysAgo;
      while (remaining > 0) {
        if (d2 > 1) {
          let maxStep : Nat = if (d2 > 1) d2 - 1 else 0;
          let step = if (remaining < maxStep) remaining else maxStep;
          d2 := if (d2 >= step) d2 - step else 0;
          remaining := if (remaining >= step) remaining - step else 0;
        } else {
          // Go back one month
          if (m2 == 1) {
            m2 := 12;
            y2 := if (y2 > 0) y2 - 1 else 0;
          } else {
            m2 := if (m2 > 0) m2 - 1 else 0;
          };
          // Set day to last day of new month (use 28 as safe minimum)
          let daysInMonth : Nat = switch (m2) {
            case 1 31; case 2 28; case 3 31; case 4 30;
            case 5 31; case 6 30; case 7 31; case 8 31;
            case 9 30; case 10 31; case 11 30; case 12 31;
            case _ 30;
          };
          d2 := daysInMonth;
          remaining := if (remaining > 0) remaining - 1 else 0;
        };
      };
      y2.toText() # "-"
        # (if (m2 < 10) "0" else "") # m2.toText() # "-"
        # (if (d2 < 10) "0" else "") # d2.toText();
    };

    let samples : [(Text, Float, Text, Nat, ?Text, ?Text)] = [
      ("Grocery Shopping", 1850.0, "Food", 0, ?("Weekly groceries"), ?("Credit Card")),
      ("Uber Ride", 320.0, "Transport", 1, null, ?("UPI")),
      ("Netflix Subscription", 649.0, "Entertainment", 2, ?("Monthly plan"), ?("Credit Card")),
      ("Doctor Visit", 1200.0, "Health", 3, ?("General checkup"), ?("Cash")),
      ("Electricity Bill", 2200.0, "Utilities", 4, ?("Monthly bill"), ?("Net Banking")),
      ("Restaurant Lunch", 780.0, "Food", 5, ?("Team lunch"), ?("Debit Card")),
      ("Metro Card Recharge", 500.0, "Transport", 7, null, ?("UPI")),
      ("Amazon Order", 3200.0, "Shopping", 8, ?("Electronics"), ?("Credit Card")),
      ("Online Course", 4500.0, "Education", 10, ?("Python course"), ?("Credit Card")),
      ("Pharmacy", 450.0, "Health", 12, ?("Medicines"), ?("Cash")),
      ("Internet Bill", 999.0, "Utilities", 14, ?("Monthly broadband"), ?("Net Banking")),
      ("Movie Tickets", 600.0, "Entertainment", 16, ?("Weekend movie"), ?("Debit Card")),
      ("Book Purchase", 750.0, "Education", 18, ?("Design books"), ?("UPI")),
      ("Clothing Store", 2800.0, "Shopping", 21, ?("Winter clothes"), ?("Credit Card")),
      ("Breakfast Cafe", 360.0, "Other", 25, ?("Morning coffee & breakfast"), ?("Cash")),
    ];

    var id = nextId;
    for ((title, amount, category, daysAgo, note, payMethod) in samples.values()) {
      let dateStr = offsetDate(daysAgo);
      let expense : Expense = {
        id = id;
        title = title;
        amount = amount;
        category = category;
        date = dateStr;
        note = note;
        payment_method = payMethod;
        created_at = today # "T00:00:00Z";
      };
      expenses.add(expense);
      id := id + 1;
    };
    id;
  };
};
