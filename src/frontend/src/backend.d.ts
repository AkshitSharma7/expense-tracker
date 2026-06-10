import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ExpenseInput {
    title: string;
    date: string;
    note?: string;
    payment_method?: string;
    category: string;
    amount: number;
}
export interface Expense {
    id: bigint;
    title: string;
    date: string;
    note?: string;
    created_at: string;
    payment_method?: string;
    category: string;
    amount: number;
}
export interface CategorySummary {
    total: number;
    category: string;
}
export interface BudgetInput {
    monthly_limit: number;
    category: string;
}
export interface Budget {
    id: bigint;
    monthly_limit: number;
    category: string;
}
export interface backendInterface {
    addExpense(input: ExpenseInput): Promise<bigint>;
    deleteExpense(id: bigint): Promise<boolean>;
    getBudgets(): Promise<Array<Budget>>;
    getExpenses(): Promise<Array<Expense>>;
    getMonthlySummary(year: bigint, month: bigint): Promise<Array<CategorySummary>>;
    getTodaySpending(): Promise<number>;
    seedSampleData(): Promise<void>;
    setBudget(input: BudgetInput): Promise<void>;
    updateExpense(id: bigint, input: ExpenseInput): Promise<boolean>;
}
