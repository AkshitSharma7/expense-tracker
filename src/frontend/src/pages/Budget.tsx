import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBudgets,
  useMonthlySummary,
  useSetBudget,
} from "@/hooks/useExpenses";
import { CURRENCY, formatCurrency, getMonthYear } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/types";
import { PiggyBank, TrendingDown, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const { year, month } = getMonthYear();

function ProgressBar({ pct }: { pct: number }) {
  const fill = Math.min(100, pct);
  const color = pct >= 100 ? "#E74C3C" : pct >= 80 ? "#F59E0B" : "#2ECC71";

  return (
    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${fill}%`, background: color }}
      />
    </div>
  );
}

interface CategoryRowProps {
  category: Category;
  spent: number;
  limit: number;
}

function CategoryRow({ category, spent, limit }: CategoryRowProps) {
  const [value, setValue] = useState(limit > 0 ? String(limit) : "");
  const setbudget = useSetBudget();
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  const numericValue = Number.parseFloat(value) || 0;
  const isDirty = numericValue !== limit;
  const isOver = pct >= 100;
  const isWarn = pct >= 80 && pct < 100;

  // Sync external limit changes into local state
  useEffect(() => {
    setValue(limit > 0 ? String(limit) : "");
  }, [limit]);

  function handleSave() {
    if (!isDirty || numericValue <= 0) return;
    setbudget.mutate(
      { category, monthly_limit: numericValue },
      {
        onSuccess: () => {
          toast.success(`Budget for ${category} saved!`);
        },
        onError: () => {
          toast.error("Failed to save budget. Please try again.");
        },
      },
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">{category}</p>
          <p
            className="text-xs mt-0.5 font-medium"
            style={{
              color: isOver ? "#E74C3C" : isWarn ? "#F59E0B" : "#6B7280",
            }}
          >
            {formatCurrency(spent)} spent
            {limit > 0 && (
              <span className="text-muted-foreground font-normal">
                {" "}
                of {formatCurrency(limit)}
              </span>
            )}
          </p>
        </div>
        {limit > 0 && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isOver ? "#FEE2E2" : isWarn ? "#FEF3C7" : "#DCFCE7",
              color: isOver ? "#E74C3C" : isWarn ? "#F59E0B" : "#16A34A",
            }}
          >
            {pct.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar pct={pct} />

      {/* Budget Input + Save */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {CURRENCY}
          </span>
          <Input
            data-ocid={`budget.limit_input.${category.toLowerCase()}`}
            type="number"
            min="0"
            step="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Set limit"
            className="pl-7 text-sm h-9"
          />
        </div>
        <Button
          data-ocid={`budget.save_button.${category.toLowerCase()}`}
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || numericValue <= 0 || setbudget.isPending}
          className="h-9 px-4 text-sm"
        >
          {setbudget.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}

interface SummaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function SummaryStat({ icon, label, value, sub, accent }: SummaryStatProps) {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent ? `${accent}18` : undefined }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold text-foreground leading-tight truncate">
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function Budget() {
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(
    year,
    month,
  );

  const isLoading = budgetsLoading || summaryLoading;

  // Build a map of category → spent from monthly summary
  const spentMap: Record<string, number> = {};
  if (summary) {
    for (const item of summary) {
      spentMap[item.category] = item.total;
    }
  }

  // Build a map of category → limit from budgets
  const limitMap: Record<string, number> = {};
  if (budgets) {
    for (const b of budgets) {
      limitMap[b.category] = b.monthly_limit;
    }
  }

  const totalBudget = Object.values(limitMap).reduce((a, v) => a + v, 0);
  const totalSpent = Object.values(spentMap).reduce((a, v) => a + v, 0);
  const remaining = totalBudget - totalSpent;
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div data-ocid="budget.page" className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Budget Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{monthLabel}</p>
      </div>

      {/* Summary Card */}
      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : (
        <Card data-ocid="budget.summary_card" className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <SummaryStat
              icon={<Wallet size={20} style={{ color: "#3D5AFE" }} />}
              label="Total Budget"
              value={totalBudget > 0 ? formatCurrency(totalBudget) : "Not set"}
              sub="sum of all limits"
              accent="#3D5AFE"
            />
            <div className="pt-4 sm:pt-0 sm:pl-6 flex-1 min-w-0">
              <SummaryStat
                icon={<TrendingDown size={20} style={{ color: "#E74C3C" }} />}
                label="Total Spent This Month"
                value={formatCurrency(totalSpent)}
                sub={
                  totalBudget > 0
                    ? `${overallPct.toFixed(1)}% of budget used`
                    : undefined
                }
                accent="#E74C3C"
              />
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6 flex-1 min-w-0">
              <SummaryStat
                icon={
                  <PiggyBank
                    size={20}
                    style={{ color: remaining >= 0 ? "#2ECC71" : "#E74C3C" }}
                  />
                }
                label="Remaining"
                value={
                  totalBudget > 0 ? formatCurrency(Math.abs(remaining)) : "—"
                }
                sub={
                  totalBudget > 0
                    ? remaining < 0
                      ? "over budget"
                      : "available"
                    : "set budgets to track"
                }
                accent={remaining >= 0 ? "#2ECC71" : "#E74C3C"}
              />
            </div>
          </div>
          {/* Overall progress bar */}
          {totalBudget > 0 && (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Overall budget usage</span>
                <span className="font-medium">{overallPct.toFixed(1)}%</span>
              </div>
              <ProgressBar pct={overallPct} />
            </div>
          )}
        </Card>
      )}

      {/* Category Grid */}
      {isLoading ? (
        <div
          data-ocid="budget.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <Skeleton key={cat} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          data-ocid="budget.categories_grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {CATEGORIES.map((cat, i) => (
            <div key={cat} data-ocid={`budget.category_card.${i + 1}`}>
              <CategoryRow
                category={cat}
                spent={spentMap[cat] ?? 0}
                limit={limitMap[cat] ?? 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
