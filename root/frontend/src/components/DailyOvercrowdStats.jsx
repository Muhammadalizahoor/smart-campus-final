//frontend//src//components//DailyOvercrowdStats.jsx
import React from "react";
import "../styles/analytics.css";

function StatCard({ stat, highlight }) {
  if (!stat) return null;

  return (
    <div
      className={
        "kpi-card" + (highlight ? " kpi-card-highlight" : "")
      }
    >
      <div className="kpi-card-top">
        <span className="kpi-icon">{stat.icon || "📊"}</span>
      </div>
      <p className="kpi-label">{stat.label}</p>
      <h3 className="kpi-value">{stat.value}</h3>
      <p className="kpi-subtext">{stat.subtext}</p>
    </div>
  );
}

export default function DailyOvercrowdStats({ data }) {
  if (!data) return null;

  const { totalOvercrowded, maxRoute, averageHourly } = data;

  return (
    <div className="kpi-grid">
      <StatCard stat={totalOvercrowded} highlight />
      <StatCard stat={maxRoute} />
      <StatCard stat={averageHourly} />
    </div>
  );
}
