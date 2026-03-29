//frontend/src/components/MonthlyOvercrowdChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonthlyOvercrowdChart({ data = [] }) {
  if (!data.length) {
    return <div style={{ padding: 20 }}>No data this month</div>;
  }

const chartData = data.map((d) => ({
  label: `${d.weekday} (${d.date})`,
  passengers: d.currentPassengers,
}));


  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="label" />

        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="passengers" fill="#16a34a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
