import React, { useState, useEffect } from "react";

// importing stuff from Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

import { Doughnut, Bar, Line } from "react-chartjs-2";
import API from "../../api";
import Loader from "../Loader";

// register everything needed for chart types
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// this component shows 3 charts (pie, bar, line)
function SummaryCharts({ dateRange, refreshTrigger }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // when date range changes or refresh trigger hits, we fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // get the summary stats from backend (filtered by date)
        const { data } = await API.get("/transactions/stats", {
          params: dateRange,
        });

        // ---------- Doughnut chart: Expenses by category ----------
        const expenseData = {
          labels: data.expensesByCategory.map((e) => e.name),
          datasets: [
            {
              data: data.expensesByCategory.map((e) => e.total),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
            },
          ],
        };

        // ---------- Bar chart: Income vs Expense ----------
        const income =
          data.incomeVsExpense.find((i) => i.name === "income")?.total || 0;
        const expense =
          data.incomeVsExpense.find((i) => i.name === "expense")?.total || 0;

        const incomeVsExpenseData = {
          labels: ["Summary"],
          datasets: [
            {
              label: "Income",
              data: [income],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
            {
              label: "Expense",
              data: [expense],
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
          ],
        };

        // ---------- Line chart: Daily expense trend ----------
        const dailyExpenseData = {
          labels: data.dailyExpenses.map((d) => d.date),
          datasets: [
            {
              label: "Daily Expenses",
              data: data.dailyExpenses.map((d) => d.total),
              fill: false,
              borderColor: "rgb(255, 99, 132)",
              tension: 0.1,
            },
          ],
        };

        // update state with all chart data
        setChartData({ expenseData, incomeVsExpenseData, dailyExpenseData });
      } catch (error) {
        console.error("Failed to fetch chart data", error);
        setChartData(null);
      }
      setLoading(false);
    };

    // make sure both dates are selected before fetching
    if (dateRange.startDate && dateRange.endDate) {
      fetchStats();
    }
  }, [dateRange, refreshTrigger]);

  // show loader while loading
  if (loading) return <Loader />;

  // if no data came back (error or empty)
  if (!chartData)
    return <p>No data available for charts for the selected date range.</p>;

  return (
    <div className="dashboard-grid" style={{ alignItems: "flex-start" }}>
      {/* Expense by Category - Doughnut */}
      <div className="card">
        <h3>Expenses by Category</h3>
        {chartData.expenseData.labels.length > 0 ? (
          <Doughnut data={chartData.expenseData} />
        ) : (
          <p>No expense data.</p>
        )}
      </div>

      {/* Income vs Expense - Bar */}
      <div className="card">
        <h3>Income vs. Expense</h3>
        <Bar
          data={chartData.incomeVsExpenseData}
          options={{ scales: { y: { beginAtZero: true } } }}
        />
      </div>

      {/* Daily Expense - Line Chart */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3>Daily Expense Trend</h3>
        {chartData.dailyExpenseData.labels.length > 0 ? (
          <Line data={chartData.dailyExpenseData} />
        ) : (
          <p>No daily expense data.</p>
        )}
      </div>
    </div>
  );
}

export default SummaryCharts;
