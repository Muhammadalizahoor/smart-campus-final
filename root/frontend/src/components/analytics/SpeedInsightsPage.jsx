
"use client";
import React, { useState } from "react";

import Sidebar from "../Sidebar";
import Header from "../Header";

import SpeedStatsCards from "./SpeedStatsCards";
import SpeedEventsTable from "./SpeedEventsTable";
import SpeedCharts from "./SpeedCharts";

import "../../styles/analytics.css";

export default function SpeedInsightsPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [analysisType, setAnalysisType] = useState("daily");

  return (
    <div className="admin-layout">
      <Sidebar />

      {/* ✅ THIS IS THE FIX */}
      <div className="admin-content-wrapper">
        <Header title="Speed Insights" />

        <div className="analytics-container">

          {/* TABS */}
          <div className="tabs-section">
            <div>
              <button
                className={`tab-button ${activeTab === "events" ? "active" : ""}`}
                onClick={() => setActiveTab("events")}
              >
                Speed Events
              </button>

              <button
                className={`tab-button ${activeTab === "visual" ? "active" : ""}`}
                onClick={() => setActiveTab("visual")}
              >
                Visual Insights
              </button>
            </div>

            {activeTab === "visual" && (
              <select
                className="analysis-dropdown"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="daily">Daily Analysis</option>
                <option value="monthly">Monthly Analysis</option>
              </select>
            )}
          </div>

          {/* KPI CARDS */}
          <SpeedStatsCards />

          {/* CONTENT */}
          {activeTab === "events" && (
            <div className="chart-section">
              <SpeedEventsTable />
            </div>
          )}

          {activeTab === "visual" && (
            <div className="chart-section">
              <SpeedCharts analysisType={analysisType} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
