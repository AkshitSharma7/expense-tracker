import { Card, CardHeader, CardTitle } from "@/components/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets, useExpenses, useTodaySpending } from "@/hooks/useExpenses";
import {
  formatCurrency,
  formatDate,
  getMonthYear,
  getTodayString,
} from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#3D5AFE",
  Transport: "#2ECC71",
  Shopping: "#F59E0B",
  Entertainment: "#A855F7",
  Health: "#E74C3C",
  Utilities: "#06B6D4",
  Education: "#EC4899",
  Other: "#6B7280",
};

interface SummaryCardProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  accentColor?: string;
  "data-ocid"?: string;
}

function SummaryCard({
  icon,
  label,
  value,
  subValue,
  accentColor,
  "data-ocid": ocid,
}: SummaryCardProps) {
  return (
    <Card className="flex-1 min-w-0" data-ocid={ocid}>
      <div className="flex items-start gap-3">
        <span
          className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
          style={{ background: accentColor ? `${accentColor}18` : undefined }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: "#6B7280" }}
          >
            {label}
          </p>
          <p
            className="text-xl font-display font-bold text-foreground mt-0.5 truncate"
            style={{ color: accentColor ?? undefined }}
          >
            {value}
          </p>
          {subValue && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>
              {subValue}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-1 bg-white rounded-lg border border-border shadow-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium text-foreground">{payload[0].name}</p>
        <p className="text-accent">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-2">
      <span className="text-4xl">📭</span>
      <p className="text-sm" style={{ color: "#6B7280" }}>
        {message}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: todaySpending, isLoading: todayLoading } = useTodaySpending();

  const isLoading = expensesLoading || budgetsLoading || todayLoading;
  const today = getTodayString();
  const { year, month } = getMonthYear();

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const monthlyExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.date.startsWith(monthStr)),
    [expenses, monthStr],
  );

  const totalThisMonth = useMemo(
    () => monthlyExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthlyExpenses],
  );

  const todayTotal = useMemo(() => {
    if (todaySpending !== undefined) return todaySpending;
    return (expenses ?? [])
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todaySpending, expenses, today]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of monthlyExpenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return map;
  }, [monthlyExpenses]);

  const biggestCategory = useMemo(() => {
    let best = { name: "—", amount: 0 };
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > best.amount) best = { name: cat, amount: amt };
    }
    return best;
  }, [categoryTotals]);

  const totalBudget = useMemo(
    () => (budgets ?? []).reduce((sum, b) => sum + b.monthly_limit, 0),
    [budgets],
  );
  const budgetPercent =
    totalBudget > 0 ? Math.round((totalThisMonth / totalBudget) * 100) : 0;

  const pieData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        name: cat,
        value: categoryTotals[cat] ?? 0,
      })).filter((d) => d.value > 0),
    [categoryTotals],
  );

  const last14Days = useMemo(() => {
    const days: Array<{ date: string; label: string; amount: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
      const amount = (expenses ?? [])
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      days.push({ date: dateStr, label, amount });
    }
    return days;
  }, [expenses]);

  const recentTransactions = useMemo(
    () =>
      [...(expenses ?? [])]
        .sort(
          (a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id),
        )
        .slice(0, 5),
    [expenses],
  );

  const hasNoExpenses = !isLoading && (expenses ?? []).length === 0;

  return (
    <div data-ocid="dashboard.page" className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">
        Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="flex gap-4" data-ocid="dashboard.summary.section">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <SummaryCard
              icon="💰"
              label="Total This Month"
              value={formatCurrency(totalThisMonth)}
              subValue={`${monthlyExpenses.length} transactions`}
              accentColor="#3D5AFE"
              data-ocid="dashboard.total-month.card"
            />
            <SummaryCard
              icon="📅"
              label="Today's Spending"
              value={formatCurrency(todayTotal)}
              subValue={today}
              accentColor="#2ECC71"
              data-ocid="dashboard.today.card"
            />
            <SummaryCard
              icon="🏆"
              label="Biggest Category"
              value={biggestCategory.name}
              subValue={
                biggestCategory.amount > 0
                  ? formatCurrency(biggestCategory.amount)
                  : "No data"
              }
              accentColor="#F59E0B"
              data-ocid="dashboard.biggest-category.card"
            />
            <SummaryCard
              icon="📊"
              label="Budget Status"
              value={
                totalBudget > 0 ? `${budgetPercent}% used` : "No budget set"
              }
              subValue={
                totalBudget > 0
                  ? `${formatCurrency(totalThisMonth)} of ${formatCurrency(totalBudget)}`
                  : undefined
              }
              accentColor={
                budgetPercent >= 100
                  ? "#E74C3C"
                  : budgetPercent >= 80
                    ? "#F59E0B"
                    : "#2ECC71"
              }
              data-ocid="dashboard.budget-status.card"
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div
        className="grid grid-cols-2 gap-4"
        data-ocid="dashboard.charts.section"
      >
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </CardHeader>
          {isLoading ? (
            <div className="flex justify-center items-center h-52">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
          ) : pieData.length === 0 ? (
            <EmptyState message="No expenses this month" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name] ?? "#6B7280"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
            <span className="text-xs" style={{ color: "#6B7280" }}>
              Last 14 days
            </span>
          </CardHeader>
          {isLoading ? (
            <div className="flex items-end gap-1 h-52 px-4">
              {(
                [
                  "d1",
                  "d2",
                  "d3",
                  "d4",
                  "d5",
                  "d6",
                  "d7",
                  "d8",
                  "d9",
                  "d10",
                  "d11",
                  "d12",
                  "d13",
                  "d14",
                ] as const
              ).map((k, i) => (
                <Skeleton
                  key={k}
                  className="flex-1 rounded-t"
                  style={{ height: `${30 + ((i * 7) % 55)}%` }}
                />
              ))}
            </div>
          ) : hasNoExpenses ? (
            <EmptyState message="No expense data available" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={last14Days}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                  }
                  width={52}
                />
                <Tooltip
                  content={<BarTooltip />}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar
                  dataKey="amount"
                  fill="#3D5AFE"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card data-ocid="dashboard.recent-transactions.card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <span className="text-xs font-medium" style={{ color: "#3D5AFE" }}>
            Last 5 expenses
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="space-y-3">
            {(["t1", "t2", "t3", "t4", "t5"] as const).map((k) => (
              <div key={k} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <EmptyState message="No transactions yet. Add your first expense!" />
        ) : (
          <div
            className="overflow-hidden rounded-lg border border-border"
            data-ocid="dashboard.recent-transactions.table"
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b border-border"
                  style={{ background: "#F9FAFB" }}
                >
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-foreground">
                    Category
                  </th>
                  <th className="text-right px-4 py-2.5 font-semibold text-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((expense, idx) => (
                  <tr
                    key={String(expense.id)}
                    style={{
                      background: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                    }}
                    className="border-b border-border last:border-0 hover:bg-accent/5 transition-colors"
                    data-ocid={`dashboard.recent-transactions.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3" style={{ color: "#6B7280" }}>
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[180px]">
                      <span className="truncate block">{expense.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: `${CATEGORY_COLORS[expense.category] ?? "#6B7280"}18`,
                          color: CATEGORY_COLORS[expense.category] ?? "#6B7280",
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-right font-semibold"
                      style={{ color: "#3D5AFE" }}
                    >
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
