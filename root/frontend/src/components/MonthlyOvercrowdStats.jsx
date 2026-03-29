//frontend/src/components/MonthlyOvercrowdStats.jsx
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
        <span className="kpi-icon">{stat.icon || "📈"}</span>
        {stat.trend && (
          <span
            className={
              "kpi-trend " +
              (stat.trendDown ? "kpi-trend-down" : "kpi-trend-up")
            }
          >
            {stat.trend}
          </span>
        )}
      </div>
      <p className="kpi-label">{stat.label}</p>
      <h3 className="kpi-value">{stat.value}</h3>
      <p className="kpi-subtext">{stat.subtext}</p>
    </div>
  );
}

export default function MonthlyOvercrowdStats({ data }) {
  if (!data || !data.length) return null;

  let total = 0, peak = data[0], low = data[0];

  data.forEach(d => {
    total += d.percentOvercrowded;
    if (d.percentOvercrowded > peak.percentOvercrowded) peak = d;
    if (d.percentOvercrowded < low.percentOvercrowded) low = d;
  });

  return (
    <div className="kpi-grid">
      <div className="kpi-card kpi-card-highlight">
        <p>Avg Overcrowding</p>
        <h3>{Math.round(total / data.length)}%</h3>
      </div>

      <div className="kpi-card">
        <p>Peak Day</p>
        <h3>{peak.date}</h3>
      </div>

      <div className="kpi-card">
        <p>Lowest Day</p>
        <h3>{low.date}</h3>
      </div>
    </div>
  );
}
