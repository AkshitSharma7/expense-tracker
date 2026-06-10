export interface Expense {
  id: bigint;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  payment_method?: string;
  created_at: string;
}

export interface Budget {
  id: bigint;
  category: string;
  monthly_limit: number;
}

export interface CategorySummary {
  category: string;
  total: number;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  payment_method?: string;
}

export interface BudgetInput {
  category: string;
  monthly_limit: number;
}

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "UPI",
  "Net Banking",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
