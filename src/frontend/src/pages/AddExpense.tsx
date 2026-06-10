import { Card } from "@/components/Card";
import { useAddExpense } from "@/hooks/useExpenses";
import { cn, getTodayString } from "@/lib/utils";
import { CATEGORIES, PAYMENT_METHODS } from "@/types";
import type { ExpenseInput } from "@/types";
import { CheckCircle2, PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FormErrors {
  title?: string;
  amount?: string;
  date?: string;
}

const getInitialForm = () => ({
  title: "",
  amount: "",
  category: CATEGORIES[0] as string,
  date: getTodayString(),
  payment_method: PAYMENT_METHODS[0] as string,
  note: "",
});

export default function AddExpense() {
  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addExpense = useAddExpense();

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    const amt = Number.parseFloat(form.amount);
    if (!form.amount || Number.isNaN(amt) || amt <= 0)
      newErrors.amount = "Valid amount is required";
    if (!form.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleAmountKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const allowed = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (e.key === "." && !form.amount.includes(".")) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const input: ExpenseInput = {
      title: form.title.trim(),
      amount: Number.parseFloat(form.amount),
      category: form.category,
      date: form.date,
      note: form.note.trim() || undefined,
      payment_method: form.payment_method || undefined,
    };

    addExpense.mutate(input, {
      onSuccess: () => {
        setForm(getInitialForm());
        setErrors({});
        setShowSuccess(true);
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
        successTimerRef.current = setTimeout(() => setShowSuccess(false), 2000);
        toast.success("Expense added successfully!");
      },
      onError: () => {
        toast.error("Failed to add expense. Please try again.");
      },
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto" data-ocid="add_expense.page">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Add Expense
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record a new expense to track your spending.
        </p>
      </div>

      <Card className="max-w-lg mx-auto">
        {/* Success Banner */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            showSuccess
              ? "max-h-16 mb-5 opacity-100"
              : "max-h-0 mb-0 opacity-0",
          )}
          data-ocid="add_expense.success_state"
        >
          <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Expense added successfully!
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="exp-title"
              className="block text-sm font-medium text-foreground"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="exp-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Grocery shopping"
              data-ocid="add_expense.title.input"
              className={cn(
                "w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150",
                errors.title ? "border-red-500" : "border-input",
              )}
            />
            {errors.title && (
              <p
                className="text-xs text-red-500"
                data-ocid="add_expense.title.field_error"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="exp-amount"
              className="block text-sm font-medium text-foreground"
            >
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
                ₹
              </span>
              <input
                id="exp-amount"
                type="text"
                inputMode="decimal"
                value={form.amount}
                onKeyDown={handleAmountKeyDown}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                data-ocid="add_expense.amount.input"
                className={cn(
                  "w-full rounded-md border px-3 py-2 pl-7 text-sm bg-background text-foreground",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150",
                  errors.amount ? "border-red-500" : "border-input",
                )}
              />
            </div>
            {errors.amount && (
              <p
                className="text-xs text-red-500"
                data-ocid="add_expense.amount.field_error"
              >
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category + Date (two columns) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="exp-category"
                className="block text-sm font-medium text-foreground"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="exp-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                data-ocid="add_expense.category.select"
                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="exp-date"
                className="block text-sm font-medium text-foreground"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="exp-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                data-ocid="add_expense.date.input"
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150",
                  errors.date ? "border-red-500" : "border-input",
                )}
              />
              {errors.date && (
                <p
                  className="text-xs text-red-500"
                  data-ocid="add_expense.date.field_error"
                >
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label
              htmlFor="exp-payment"
              className="block text-sm font-medium text-foreground"
            >
              Payment Method
            </label>
            <select
              id="exp-payment"
              value={form.payment_method}
              onChange={(e) =>
                setForm({ ...form, payment_method: e.target.value })
              }
              data-ocid="add_expense.payment_method.select"
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150 cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="exp-note"
              className="block text-sm font-medium text-foreground"
            >
              Notes{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (optional)
              </span>
            </label>
            <textarea
              id="exp-note"
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Any additional details..."
              data-ocid="add_expense.note.textarea"
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/40 focus:border-[#3D5AFE] transition-colors duration-150 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={addExpense.isPending}
            data-ocid="add_expense.submit_button"
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-white",
              "bg-[#3D5AFE] hover:bg-[#3451e0] active:bg-[#2d47c9]",
              "focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/50 focus:ring-offset-2",
              "transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
            )}
          >
            {addExpense.isPending ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Add Expense
              </>
            )}
          </button>
        </form>
      </Card>
    </div>
  );
}
