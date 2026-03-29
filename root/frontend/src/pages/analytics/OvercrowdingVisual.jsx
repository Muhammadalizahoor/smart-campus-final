
// // // //frontend/src/pages/analytics/OvercrowdingVisual.jsx


// export default OvercrowdingVisual;
"use client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import DailyOvercrowdChart from "../../components/DailyOvercrowdChart";
import MonthlyOvercrowdChart from "../../components/MonthlyOvercrowdChart";
import DailyOvercrowdStats from "../../components/DailyOvercrowdStats";
import MonthlyOvercrowdStats from "../../components/MonthlyOvercrowdStats";

import "../../styles/analytics.css";

function OvercrowdingVisual() {
  const API = "https://smart-campus-backend-iuqo.onrender.com";

  const [buses, setBuses] = useState([]);

  const [selectedBus, setSelectedBus] = useState("");
  const [analysisType, setAnalysisType] = useState("daily");

  const [dailyChart, setDailyChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);

  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);

  const [loading, setLoading] = useState(false);

  // ✅ month selector (monthly)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // ✅ date selector (daily) — default today (aap change kar sakti ho)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
function normalizeBusId(id) {
  if (!id) return "";
  return id
    .toString()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/^bus(\d+)/, "bus_$1");
}

  /* ================= LOAD BUSES (dynamic dropdown) ================= */
  useEffect(() => {
    async function loadBuses() {
      try {
        const res = await fetch(`${API}/api/buses`);
        const json = await res.json();

        // expected: array of buses
        const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        setBuses(rows);

        // auto select first bus if none selected
        if (!selectedBus && rows.length > 0) {
          const firstId = rows[0].busId || rows[0].id || rows[0].bus_id;
         // if (firstId) setSelectedBus(firstId);
        if (firstId) {
  setSelectedBus(normalizeBusId(firstId));
}


        }
      } catch (e) {
        console.error("❌ Failed to load buses:", e);
      }
    }
    loadBuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= DAILY DATA ================= */
  useEffect(() => {
    if (!selectedBus || analysisType !== "daily") return;

    async function loadDaily() {
      try {
        setLoading(true);

        const [chartRes, statsRes] = await Promise.all([
          fetch(
            `${API}/api/overcrowding/chart?type=daily&busId=${encodeURIComponent(
              selectedBus
            )}&date=${encodeURIComponent(selectedDate)}`
          ),
          fetch(
            `${API}/api/overcrowding/daily-stats?busId=${encodeURIComponent(
              selectedBus
            )}&date=${encodeURIComponent(selectedDate)}`
          ),
        ]);

        const chartData = await chartRes.json();
        const statsData = await statsRes.json();

        setDailyChart(Array.isArray(chartData) ? chartData : []);
        setDailyStats(statsData || null);
      } catch (err) {
        console.error("Daily load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDaily();
  }, [selectedBus, analysisType, selectedDate]);

  /* ================= MONTHLY DATA ================= */
  useEffect(() => {
    if (!selectedBus || analysisType !== "monthly") return;

    async function loadMonthly() {
      try {
        setLoading(true);

        const [chartRes, statsRes] = await Promise.all([
          fetch(
            `${API}/api/overcrowding/chart?type=monthly&busId=${encodeURIComponent(
              selectedBus
            )}&month=${encodeURIComponent(selectedMonth)}`
          ),
          fetch(
            `${API}/api/overcrowding/monthly-stats?busId=${encodeURIComponent(
              selectedBus
            )}&month=${encodeURIComponent(selectedMonth)}`
          ),
        ]);

        const chartData = await chartRes.json();
        const statsData = await statsRes.json();

        setMonthlyChart(Array.isArray(chartData) ? chartData : []);
        setMonthlyStats(statsData || null);
      } catch (err) {
        console.error("Monthly load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMonthly();
  }, [selectedBus, selectedMonth, analysisType]);

  // helper label
  function busLabel(b) {
    const id = b.busId || b.id || b.bus_id || "";
    const plate = b.plateNumber || b.plate_number || "";
    const cap = b.capacity ?? "";
    // show like: "bus_143 (cap 15)"
    return `${plate ? `Bus ${plate}` : id} (cap ${cap})`;
  }

  return (
    <div>
      <Header />
      <Sidebar />

      <div className="admin-content-wrapper">
        <div className="analysis-topbar">
          <div className="analysis-tabs">
            <Link to="/admin/analytics/visual">
              <button className="analysis-tab">OverCrowding Events</button>
            </Link>

            <button className="analysis-tab analysis-tab-active">
              Visual Insights
            </button>
          </div>

          {/* BUS SELECTOR (dynamic) */}
          <select
            value={selectedBus}
            //onChange={(e) => setSelectedBus(e.target.value)}
            onChange={(e) => {
  setSelectedBus(normalizeBusId(e.target.value));
}}

            className="analysis-select"
          >
            <option value="">Select Bus</option>
            {buses.map((b, idx) => {
              const id = b.busId || b.id || b.bus_id;
              if (!id) return null;
              return (
                <option
  key={id + "_" + idx}
  value={normalizeBusId(id)}
>

                  {busLabel(b)}
                </option>
              );
            })}
          </select>

          {/* ANALYSIS TYPE */}
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="analysis-select"
          >
            <option value="daily">Daily Analysis</option>
            <option value="monthly">Monthly Analysis</option>
          </select>
        </div>

        {/* DAILY date selector */}
        {analysisType === "daily" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "600" }}>
              Select Date:&nbsp;
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
          </div>
        )}

        {/* MONTHLY month selector */}
        {analysisType === "monthly" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "600" }}>
              Select Month:&nbsp;
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </label>
          </div>
        )}

        {loading && <div className="chart-loading">Loading data...</div>}

        {/* DAILY VIEW */}
        {analysisType === "daily" && selectedBus && !loading && (
          <>
            {dailyStats && <DailyOvercrowdStats data={dailyStats} />}
            <div className="chart-section">
              <h2 className="chart-title">Daily Overcrowd Pattern</h2>
              <DailyOvercrowdChart data={dailyChart} />
            </div>
          </>
        )}

        {/* MONTHLY VIEW */}
        {analysisType === "monthly" && selectedBus && !loading && (
          <>
            {monthlyStats && <MonthlyOvercrowdStats data={monthlyStats} />}
            <div className="chart-section">
              <h2 className="chart-title">Monthly Overcrowding Pattern</h2>
              <MonthlyOvercrowdChart data={monthlyChart} />
            </div>
          </>
        )}

        {!selectedBus && (
          <div style={{ padding: 20, color: "#6b7280" }}>
            Please select a bus to view analytics.
          </div>
        )}
      </div>
    </div>
  );
}

export default OvercrowdingVisual;















