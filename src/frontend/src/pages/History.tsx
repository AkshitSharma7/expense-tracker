import { Card, CardHeader, CardTitle } from "@/components/Card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from "@/hooks/useExpenses";
import {
  CURRENCY,
  formatCurrency,
  formatDate,
  getLast12Months,
  getTodayString,
} from "@/lib/utils";
import {
  CATEGORIES,
  type Expense,
  type ExpenseInput,
  PAYMENT_METHODS,
} from "@/types";
import { Download, Edit2, FileText, Search, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── helpers ────────────────────────────────────────────────────────────────

function toMonthKey(dateStr: string): string {
  // dateStr = "YYYY-MM-DD"
  return dateStr.slice(0, 7);
}

// ── Edit modal ─────────────────────────────────────────────────────────────

interface EditDialogProps {
  expense: Expense | null;
  open: boolean;
  onClose: () => void;
}

function EditDialog({ expense, open, onClose }: EditDialogProps) {
  const updateExpense = useUpdateExpense();
  const months = getLast12Months();

  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState(expense?.category ?? CATEGORIES[0]);
  const [date, setDate] = useState(expense?.date ?? getTodayString());
  const [paymentMethod, setPaymentMethod] = useState(
    expense?.payment_method ?? PAYMENT_METHODS[0],
  );
  const [note, setNote] = useState(expense?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-init state when expense changes
  const lastIdRef = useRef<bigint | null>(null);
  if (expense && expense.id !== lastIdRef.current) {
    lastIdRef.current = expense.id;
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.date);
    setPaymentMethod(expense.payment_method ?? PAYMENT_METHODS[0]);
    setNote(expense.note ?? "");
    setErrors({});
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    const amt = Number.parseFloat(amount);
    if (!amount || Number.isNaN(amt) || amt <= 0)
      errs.amount = "Enter a valid amount";
    if (!date) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave() {
    if (!expense || !validate()) return;
    const input: ExpenseInput = {
      title: title.trim(),
      amount: Number.parseFloat(amount),
      category,
      date,
      note: note.trim() || undefined,
      payment_method: paymentMethod || undefined,
    };
    updateExpense.mutate(
      { id: expense.id, input },
      {
        onSuccess: () => {
          toast.success("Expense updated successfully");
          onClose();
        },
        onError: () => toast.error("Failed to update expense"),
      },
    );
  }

  // silence lint – months used for validation only
  void months;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="history.edit_dialog"
        aria-describedby="edit-dialog-desc"
      >
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <p id="edit-dialog-desc" className="sr-only">
          Edit the details of the selected expense
        </p>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              data-ocid="history.edit_title.input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lunch at cafe"
            />
            {errors.title && (
              <p
                data-ocid="history.edit_title.field_error"
                className="text-xs text-destructive"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="edit-amount">Amount ({CURRENCY}) *</Label>
            <Input
              id="edit-amount"
              data-ocid="history.edit_amount.input"
              value={amount}
              onChange={(e) => {
                if (/^\d*\.?\d*$/.test(e.target.value))
                  setAmount(e.target.value);
              }}
              placeholder="0.00"
            />
            {errors.amount && (
              <p
                data-ocid="history.edit_amount.field_error"
                className="text-xs text-destructive"
              >
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-ocid="history.edit_category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                data-ocid="history.edit_date.input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger data-ocid="history.edit_payment.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <Label htmlFor="edit-note">Note</Label>
            <Textarea
              id="edit-note"
              data-ocid="history.edit_note.textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="history.edit_cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateExpense.isPending}
            data-ocid="history.edit_save_button"
          >
            {updateExpense.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function History() {
  const { data: expenses = [], isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const months = getLast12Months();

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");

  // Edit / delete state
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return expenses.filter((e) => {
      if (
        q &&
        !e.title.toLowerCase().includes(q) &&
        !(e.note ?? "").toLowerCase().includes(q)
      )
        return false;
      if (filterCategory !== "All" && e.category !== filterCategory)
        return false;
      if (filterMonth !== "All" && toMonthKey(e.date) !== filterMonth)
        return false;
      if (filterPayment !== "All" && e.payment_method !== filterPayment)
        return false;
      return true;
    });
  }, [expenses, search, filterCategory, filterMonth, filterPayment]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  // ── CSV export ────────────────────────────────────────────────────────────
  function handleExport() {
    const header = "Date,Title,Category,Amount,Payment Method,Note";
    const rows = filtered.map((e) =>
      [
        e.date,
        `"${e.title.replace(/"/g, '""')}"`,
        e.category,
        e.amount.toFixed(2),
        e.payment_method ?? "",
        `"${(e.note ?? "").replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  }

  // ── Delete confirm ────────────────────────────────────────────────────────
  function confirmDelete() {
    if (!deleteTarget) return;
    deleteExpense.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Expense deleted");
        setDeleteOpen(false);
        setDeleteTarget(null);
      },
      onError: () => toast.error("Failed to delete expense"),
    });
  }

  return (
    <div data-ocid="history.page" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Transaction History
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={filtered.length === 0}
          data-ocid="history.export_button"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters card */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="history.search_input"
              className="pl-9"
              placeholder="Search by title or note…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger
              data-ocid="history.category.select"
              className="w-[150px]"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month filter */}
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger
              data-ocid="history.month.select"
              className="w-[175px]"
            >
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              {months.map((m) => {
                const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
                return (
                  <SelectItem key={key} value={key}>
                    {m.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Payment filter */}
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger
              data-ocid="history.payment.select"
              className="w-[160px]"
            >
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Methods</SelectItem>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table card */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>Transactions</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items have no meaningful key
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
          >
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No transactions found</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Try adjusting your search or filters to see results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground max-w-[180px]">
                    Note
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense, idx) => (
                  <tr
                    key={String(expense.id)}
                    data-ocid={`history.item.${idx + 1}`}
                    className={[
                      "border-b border-border/60 last:border-0 transition-colors duration-150 hover:bg-accent/5",
                      idx % 2 === 0 ? "bg-card" : "bg-muted/20",
                    ].join(" ")}
                  >
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                      {expense.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <CategoryBadge category={expense.category} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {expense.payment_method ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">
                      {expense.note || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          data-ocid={`history.edit_button.${idx + 1}`}
                          aria-label={`Edit ${expense.title}`}
                          onClick={() => {
                            setEditTarget(expense);
                            setEditOpen(true);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`history.delete_button.${idx + 1}`}
                          aria-label={`Delete ${expense.title}`}
                          onClick={() => {
                            setDeleteTarget(expense);
                            setDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom bar */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "transaction" : "transactions"}
            </span>
            <span>
              Total:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(totalAmount)}
              </span>
            </span>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <EditDialog
        expense={editTarget}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-ocid="history.delete_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>"{deleteTarget?.title}"</strong> (
              {deleteTarget ? formatCurrency(deleteTarget.amount) : ""}). This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="history.delete_cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="history.delete_confirm_button"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteExpense.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Category badge ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Shopping: "bg-pink-100 text-pink-700",
  Entertainment: "bg-purple-100 text-purple-700",
  Health: "bg-green-100 text-green-700",
  Utilities: "bg-yellow-100 text-yellow-700",
  Education: "bg-cyan-100 text-cyan-700",
  Other: "bg-muted text-muted-foreground",
};

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
    >
      {category}
    </span>
  );
}
