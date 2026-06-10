module {
  public type Expense = {
    id : Nat;
    title : Text;
    amount : Float;
    category : Text;
    date : Text; // YYYY-MM-DD
    note : ?Text;
    payment_method : ?Text;
    created_at : Text;
  };

  public type ExpenseInput = {
    title : Text;
    amount : Float;
    category : Text;
    date : Text; // YYYY-MM-DD
    note : ?Text;
    payment_method : ?Text;
  };

  public type Budget = {
    id : Nat;
    category : Text;
    monthly_limit : Float;
  };

  public type BudgetInput = {
    category : Text;
    monthly_limit : Float;
  };

  public type CategorySummary = {
    category : Text;
    total : Float;
  };

  public let DEFAULT_CATEGORIES : [Text] = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Utilities",
    "Education",
    "Other",
  ];
};
