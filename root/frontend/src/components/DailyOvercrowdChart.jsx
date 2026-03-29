//frontend//src//components//DailyOvercrowdChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyOvercrowdChart({ data = [] }) {
  if (!data.length) {
    return <div style={{ padding: 20 }}>No data for today</div>;
  }

  // 🔧 FIX: Map backend timeline correctly
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    passengers: d.currentPassengers,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="passengers"
          stroke="#2563eb"
          strokeWidth={3}
          dot
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
