import { Card, CardHeader, CardTitle } from "@/components/Card";
import { useBudgets, useExpenses } from "@/hooks/useExpenses";
import { formatCurrency, getLast12Months } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACCENT = "#3D5AFE";
const BUDGET_COLOR = "#CBD5E1";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function Reports() {
  const months = getLast12Months();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = months[selectedIndex];

  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();

  const isLoading = expensesLoading || budgetsLoading;

  // Filter expenses for selected month
  const monthPrefix = `${selected.year}-${String(selected.month).padStart(2, "0")}`;
  const filtered = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthPrefix)),
    [expenses, monthPrefix],
  );

  // Budget vs Actual bar chart data
  const budgetActualData = useMemo(() => {
    const actualByCategory: Record<string, number> = {};
    for (const e of filtered) {
      actualByCategory[e.category] =
        (actualByCategory[e.category] ?? 0) + e.amount;
    }
    const budgetMap: Record<string, number> = {};
    for (const b of budgets) {
      budgetMap[b.category] = b.monthly_limit;
    }
    return CATEGORIES.map((cat) => ({
      category: cat.length > 8 ? `${cat.slice(0, 7)}…` : cat,
      fullCategory: cat,
      Budget: budgetMap[cat] ?? 0,
      Actual: actualByCategory[cat] ?? 0,
    }));
  }, [filtered, budgets]);

  // Cumulative spending line chart
  const cumulativeData = useMemo(() => {
    const totalDays = getDaysInMonth(selected.year, selected.month);
    const dailyTotals: Record<number, number> = {};
    for (const e of filtered) {
      const day = Number.parseInt(e.date.split("-")[2], 10);
      dailyTotals[day] = (dailyTotals[day] ?? 0) + e.amount;
    }
    let cumulative = 0;
    return Array.from({ length: totalDays }, (_, i) => {
      cumulative += dailyTotals[i + 1] ?? 0;
      return { day: i + 1, Amount: cumulative };
    });
  }, [filtered, selected]);

  // Summary stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const totalDays = getDaysInMonth(selected.year, selected.month);
    const totalSpend = filtered.reduce((s, e) => s + e.amount, 0);
    const highestExpense = filtered.reduce((max, e) =>
      e.amount > max.amount ? e : max,
    );
    const avgDailySpend = totalSpend / totalDays;
    const methodCount: Record<string, number> = {};
    for (const e of filtered) {
      const m = e.payment_method ?? "Unknown";
      methodCount[m] = (methodCount[m] ?? 0) + 1;
    }
    const mostUsedMethod =
      Object.entries(methodCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      highestExpense,
      avgDailySpend,
      transactionCount: filtered.length,
      mostUsedMethod,
    };
  }, [filtered, selected]);

  const hasData = filtered.length > 0;

  return (
    <div data-ocid="reports.page" className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Reports
        </h1>
        <div className="flex items-center gap-2">
          <label
            htmlFor="month-select"
            className="text-sm text-muted-foreground font-medium"
          >
            Month:
          </label>
          <select
            id="month-select"
            data-ocid="reports.month_select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="border border-input rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            {months.map((m, i) => (
              <option key={m.label} value={i}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div
          data-ocid="reports.loading_state"
          className="flex items-center justify-center h-64"
        >
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading reports…</span>
          </div>
        </div>
      ) : !hasData ? (
        <div
          data-ocid="reports.empty_state"
          className="flex flex-col items-center justify-center h-64 gap-4"
        >
          <div className="text-5xl opacity-40">📊</div>
          <p className="text-muted-foreground text-lg font-medium">
            No expenses for {selected.label}
          </p>
          <p className="text-muted-foreground text-sm">
            Add some expenses to see your reports here.
          </p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Budget vs Actual */}
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {selected.label}
                </span>
              </CardHeader>
              <div data-ocid="reports.budget_chart" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetActualData}
                    barCategoryGap="25%"
                    barGap={4}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="Budget"
                      fill={BUDGET_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="Actual" fill={ACCENT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Cumulative Spending */}
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Cumulative Spending</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {selected.label}
                </span>
              </CardHeader>
              <div data-ocid="reports.line_chart" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={cumulativeData}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Day",
                        position: "insideBottom",
                        offset: -2,
                        style: { fontSize: 11, fill: "#9CA3AF" },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Cumulative",
                      ]}
                      labelFormatter={(label: number) => `Day ${label}`}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Amount"
                      stroke={ACCENT}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: ACCENT }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Summary Stats */}
          {stats && (
            <Card className="p-5">
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {selected.label}
                </span>
              </CardHeader>
              <div
                data-ocid="reports.stats_table"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <StatItem
                  label="Highest Single Expense"
                  value={formatCurrency(stats.highestExpense.amount)}
                  sub={stats.highestExpense.title}
                  icon="💸"
                />
                <StatItem
                  label="Avg Daily Spend"
                  value={formatCurrency(stats.avgDailySpend)}
                  sub={`Over ${getDaysInMonth(selected.year, selected.month)} days`}
                  icon="📅"
                />
                <StatItem
                  label="Transactions"
                  value={String(stats.transactionCount)}
                  sub="Total this month"
                  icon="🧾"
                />
                <StatItem
                  label="Top Payment Method"
                  value={stats.mostUsedMethod}
                  sub="Most used"
                  icon="💳"
                />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

function StatItem({ label, value, sub, icon }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/40 border border-border">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xl font-display font-bold text-foreground truncate">
        {value}
      </p>
      <p className="text-xs text-muted-foreground truncate">{sub}</p>
    </div>
  );
}
