import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { weeklyRevenue } from "../../data/mockData.js";
import "./weeklyRevenue.css";

const WeeklyRevenue = () => {
  return (
    <section className="revenue-chart-card">
      <div className="revenue-chart-header">
        <div>
          <h2>Weekly Revenue</h2>
          <p>Revenue generated over the last 7 days</p>
        </div>

        <span className="revenue-chart-label">This Week</span>
      </div>

      <div className="revenue-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyRevenue}
            margin={{
              top: 15,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000}k`}
              width={45}
            />

            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              formatter={(value) => [
                `Rs. ${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            />

            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default WeeklyRevenue;