// frontend/src/components/analytics/SpeedCharts.jsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../../services/firebase";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// helpers
function pad2(n) {
  return String(n).padStart(2, "0");
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

// analysisType: "daily" | "monthly"
export default function SpeedCharts({ analysisType = "daily" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // You can later allow user-selected date/month.
  const todayKey = useMemo(() => getTodayKey(), []);
  const monthKey = useMemo(() => getMonthKey(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const colRef = collection(firestore, "speed_events");

        // Use your saved fields to query fast (NO full scan)
        const qRef =
          analysisType === "daily"
            ? query(colRef, where("date", "==", todayKey))
            : query(colRef, where("month", "==", monthKey));

        const snap = await getDocs(qRef);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRows(data);
      } catch (e) {
        console.error("SpeedCharts load error:", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [analysisType, todayKey, monthKey]);

  // ===== Build chart data =====
  const chartData = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    if (analysisType === "daily") {
      // hourly buckets 00..23
      const buckets = Array.from({ length: 24 }, (_, h) => ({
        label: `${pad2(h)}:00`,
        count: 0,
      }));

      for (const r of rows) {
        // timestamp could be Firestore Timestamp OR string/date
        let dt = null;
        if (r.timestamp?.toDate) dt = r.timestamp.toDate();
        else if (typeof r.timestamp === "string") dt = new Date(r.timestamp);
        else if (r.timestamp instanceof Date) dt = r.timestamp;

        if (!dt || isNaN(dt.getTime())) continue;

        const hour = dt.getHours();
        if (hour >= 0 && hour <= 23) buckets[hour].count += 1;
      }

      return buckets;
    }

    // monthly: day 01..31 counts
    const daysInMonth = new Date(
      Number(monthKey.slice(0, 4)),
      Number(monthKey.slice(5, 7)),
      0
    ).getDate();

    const buckets = Array.from({ length: daysInMonth }, (_, idx) => ({
      label: pad2(idx + 1),
      count: 0,
    }));

    for (const r of rows) {
      // Use r.date "YYYY-MM-DD" if available
      if (typeof r.date === "string" && r.date.startsWith(monthKey)) {
        const day = Number(r.date.slice(8, 10)); // 01..31
        if (day >= 1 && day <= daysInMonth) buckets[day - 1].count += 1;
        continue;
      }

      // fallback from timestamp
      let dt = null;
      if (r.timestamp?.toDate) dt = r.timestamp.toDate();
      else if (typeof r.timestamp === "string") dt = new Date(r.timestamp);
      else if (r.timestamp instanceof Date) dt = r.timestamp;

      if (!dt || isNaN(dt.getTime())) continue;

      const day = dt.getDate();
      if (day >= 1 && day <= daysInMonth) buckets[day - 1].count += 1;
    }

    return buckets;
  }, [rows, analysisType, monthKey]);

  return (
    <div className="chart-section">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>
          {analysisType === "daily" ? "Hourly Overspeed Events (Today)" : "Daily Overspeed Events (This Month)"}
        </h3>

        <div style={{ color: "#6b7280", fontSize: 13 }}>
          {analysisType === "daily" ? todayKey : monthKey}
        </div>
      </div>

      {loading ? (
        <p style={{ margin: 0 }}>Loading chart...</p>
      ) : chartData.length === 0 ? (
        <p style={{ margin: 0 }}>No overspeed events for this {analysisType} view.</p>
      ) : (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
