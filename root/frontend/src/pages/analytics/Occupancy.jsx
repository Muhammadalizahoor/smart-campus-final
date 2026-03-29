// frontend/src/pages/analytics/Occupancy.jsx
"use client";
import React, { useEffect, useState } from "react";

// PDF Generation Libraries
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import OvercrowdingTable from "../../components/OvercrowdingTable";
import DailyOvercrowdChart from "../../components/DailyOvercrowdChart";
import MonthlyOvercrowdChart from "../../components/MonthlyOvercrowdChart";
import DailyOvercrowdStats from "../../components/DailyOvercrowdStats";
import MonthlyOvercrowdStats from "../../components/MonthlyOvercrowdStats";

import "../../styles/analytics.css";

function Occupancy() {
  const [activeTab, setActiveTab] = useState("events");

  // ✅ bus dropdown
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState("all");

  // table
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    route: "all",
    severity: "all",
    status: "all",
    date: "",
  });

  // visuals
  const [analysisType, setAnalysisType] = useState("daily");
  const [dailyChart, setDailyChart] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [visualLoading, setVisualLoading] = useState(false);

  // ✅ month selector for monthly
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // report
  const [reportLoading, setReportLoading] = useState(false);

  // ✅ helper: normalize backend response
  const toArray = (json) => {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.rows)) return json.rows;
    if (Array.isArray(json?.events)) return json.events;
    return [];
  };

  const normalizeBusId = (raw) => {
    if (!raw) return "";
    let s = String(raw).trim();
    s = s.replace(/^Bus_/i, "");
    s = s.replace(/^bus_/i, "");
    s = s.replace(/^Bus/i, ""); 
    s = s.trim();
    if (/^bus\d+$/i.test(s)) return s.toLowerCase();
    if (/^\d+$/.test(s)) return `bus${s}`;
    const m = s.match(/bus\d+/i);
    if (m) return m[0].toLowerCase();
    return s.toLowerCase();
  };

  // ============================
  // 1) LOAD BUSES
  // ============================
  useEffect(() => {
    async function loadBuses() {
      try {
        const res = await fetch("https://smart-campus-backend-iuqo.onrender.com/api/buses?status=assigned");
        const json = await res.json();
        const list = Array.isArray(json) ? json : Array.isArray(json?.buses) ? json.buses : [];

        const cleaned = list.map((b) => {
          const rawId = b.busNumber || b.busId || b.id || "";
          const normalizedId = normalizeBusId(rawId);
          return { ...b, _normalizedId: normalizedId };
        });
        setBuses(cleaned);
      } catch (err) {
        console.warn("Buses endpoint not found, using fallback list.");
        setBuses([
          { _normalizedId: "bus727", capacity: 12 },
          { _normalizedId: "bus143", capacity: 64 },
        ]);
      }
    }
    loadBuses();
  }, []);

  // ============================
  // 2) LOAD TABLE
  // ============================
  useEffect(() => {
    async function loadTable() {
      try {
        setTableLoading(true);
        const res = await fetch("https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/table");
        const json = await res.json();
        const rows = toArray(json);

        if (selectedBus === "all") {
          setTableData(rows);
        } else {
          const busNorm = normalizeBusId(selectedBus);
          setTableData(rows.filter((r) => normalizeBusId(r.busId) === busNorm));
        }
      } catch (err) {
        console.error("Overcrowding table load error:", err);
        setTableData([]);
      } finally {
        setTableLoading(false);
      }
    }
    loadTable();
  }, [selectedBus]);

  // ============================
  // 3) LOAD VISUALS (Always running in background for PDF)
  // ============================
  useEffect(() => {
    if (selectedBus === "all") {
      setDailyChart([]);
      setMonthlyChart([]);
      setDailyStats(null);
      setMonthlyStats(null);
      return;
    }

    const busId = normalizeBusId(selectedBus);

    async function loadVisuals() {
      try {
        setVisualLoading(true);

        const dailyChartUrl = `https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/chart?type=daily&busId=${encodeURIComponent(busId)}`;
        const dailyStatsUrl = `https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/daily-stats?busId=${encodeURIComponent(busId)}`;
        const monthlyChartUrl = `https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/chart?type=monthly&busId=${encodeURIComponent(busId)}&month=${encodeURIComponent(selectedMonth)}`;
        const monthlyStatsUrl = `https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/monthly-stats?busId=${encodeURIComponent(busId)}&month=${encodeURIComponent(selectedMonth)}`;

        const [dChartRes, dStatsRes, mChartRes, mStatsRes] = await Promise.all([
          fetch(dailyChartUrl),
          fetch(dailyStatsUrl),
          fetch(monthlyChartUrl),
          fetch(monthlyStatsUrl),
        ]);

        const dChartJson = await dChartRes.json();
        const dStatsJson = await dStatsRes.json();
        const mChartJson = await mChartRes.json();
        const mStatsJson = await mStatsRes.json();

        setDailyChart(toArray(dChartJson));
        setDailyStats(dStatsJson);
        setMonthlyChart(toArray(mChartJson));
        setMonthlyStats(mStatsJson);
      } catch (err) {
        console.error("Visual load error:", err);
      } finally {
        setVisualLoading(false);
      }
    }
    loadVisuals();
  }, [selectedBus, selectedMonth]);

  // ============================
  // 4) GENERATE REPORT
  // ============================
  const generateReport = async () => {
    if (selectedBus === "all") {
      alert("Please select a bus first ✅");
      return;
    }

    const busId = normalizeBusId(selectedBus);
    setReportLoading(true);
    let fetchedReportData = null;

    // 1. Fetch AI Summary
    try {
      const url = `https://smart-campus-backend-iuqo.onrender.com/api/overcrowding/report?busId=${encodeURIComponent(busId)}&type=${encodeURIComponent(analysisType)}`;
      const res = await fetch(url);
      if (res.ok) {
        fetchedReportData = await res.json();
      }
    } catch (apiErr) {
      console.warn("Backend report API failed. Generating PDF without AI summary...", apiErr);
    }

    // 2. PDF Generation
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let finalY = 14;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(41, 82, 185);
      doc.text("Bus Overcrowding & Utilization Report", 14, finalY + 8);
      finalY += 18;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Bus ID: ${busId.toUpperCase()}`, 14, finalY);
      doc.text(`Analysis Type: ${analysisType.toUpperCase()}`, 14, finalY + 6);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 12);
      finalY += 22;

      // 🟢 CHANGED: Replaced "AI Insights & Recommendation:" with just "REPORT"
      if (fetchedReportData && fetchedReportData.recommendation) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text("REPORT", 14, finalY); // Updated text here
        finalY += 6;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Status: ${fetchedReportData.overcrowdingStatus || "N/A"}`, 14, finalY);
        finalY += 6;

        const splitRec = doc.splitTextToSize(`Note: ${fetchedReportData.recommendation}`, 180);
        doc.text(splitRec, 14, finalY);
        finalY += (splitRec.length * 5) + 6;
      }

      // Capture the instantly-ready hidden Graph
      const chartElement = document.getElementById('pdf-hidden-capture-area');
      if (chartElement) {
        const canvas = await html2canvas(chartElement, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = 180; 
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (finalY + pdfHeight > 280) {
            doc.addPage();
            finalY = 14;
        }

        doc.addImage(imgData, 'PNG', 14, finalY, pdfWidth, pdfHeight);
        finalY += pdfHeight + 15;
      }

      // ✅ FIX: Column "ROUTE" removed from table header
      const tableColumns = ["DATE", "TIME", "BUS ID", "CAPACITY", "ACTUAL", "% OVERCROWDED", "STATUS"];
      const rowsToPrint = tableData.length > 0 ? tableData : [{ routeId: "-", capacity: "-", actual: 0, percentOvercrowded: 0, status: "No Data", date: "-", timestamp: "-" }];

      const tableRows = rowsToPrint.map(row => {
        // ✅ FIX: route variable logic kept but not returned in the array to hide from table
        const capacity = row.capacity !== undefined ? row.capacity : "-";
        const actual = row.currentPassengers !== undefined ? row.currentPassengers : row.actual !== undefined ? row.actual : 0;
        const percent = row.percentOvercrowded !== undefined ? row.percentOvercrowded : row.overcrowdedPercent !== undefined ? row.overcrowdedPercent : 0;
        const status = row.status || "Normal";
        const date = row.date || "-";
        const time = row.timestamp || "-";
        
        // Returning array without route
        return [date, time, busId.toUpperCase(), capacity, actual, percent, status];
      });

      // Draw Table with RED and GREEN Colored Status
      autoTable(doc, {
        startY: finalY,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 8, halign: 'center' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        didParseCell: function(data) {
          // Adjusted index to 6 because we removed a column
          if (data.section === 'body' && data.column.index === 6) {
            const statusText = data.cell.raw ? data.cell.raw.toString().toLowerCase() : "";
            
            if (statusText.includes('normal')) {
              data.cell.styles.textColor = [39, 174, 96]; // Green
              data.cell.styles.fontStyle = 'bold';
            } else if (statusText.includes('high') || statusText.includes('over')) {
              data.cell.styles.textColor = [231, 76, 60]; // Red
              data.cell.styles.fontStyle = 'bold';
            } else if (statusText.includes('moderate')) {
              data.cell.styles.textColor = [243, 156, 18]; // Orange
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      doc.save(`Overcrowding_Report_${busId}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("PDF generation failed. Check console for details.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <Sidebar />

      <div className="admin-content-wrapper analytics-container">
        {/* TOP BAR */}
        <div className="analysis-topbar">
          <div className="analysis-tabs">
            <button
              className={"analysis-tab" + (activeTab === "events" ? " analysis-tab-active" : "")}
              onClick={() => setActiveTab("events")}
            >
              OverCrowding Events
            </button>
            <button
              className={"analysis-tab" + (activeTab === "visual" ? " analysis-tab-active" : "")}
              onClick={() => setActiveTab("visual")}
            >
              Visual Insights
            </button>
          </div>

          <div className="analysis-actions">
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="analysis-select"
            >
              <option value="all">All Buses</option>
              {buses.map((b) => {
                const value = b._normalizedId || normalizeBusId(b.busNumber || b.busId || b.id);
                const cap = b.capacity ?? 64;
                return (
                  <option key={value} value={value}>
                    {value.replace("bus", "Bus ")} (cap {cap})
                  </option>
                );
              })}
            </select>

            {activeTab === "visual" && (
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                className="analysis-select"
              >
                <option value="daily">Daily Analysis</option>
                <option value="monthly">Monthly Analysis</option>
              </select>
            )}

            <button
              className="report-btn"
              onClick={generateReport}
              disabled={reportLoading}
            >
              {reportLoading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {/* TAB 1: EVENTS */}
        {activeTab === "events" && (
          <div className="analytics-table-card">
            <OvercrowdingTable
              data={tableData}
              filters={filters}
              setFilters={setFilters}
              loading={tableLoading}
            />
          </div>
        )}

        {/* TAB 2: VISUAL */}
        {activeTab === "visual" && (
          <>
            {selectedBus === "all" && (
              <div style={{ padding: 20, color: "#6b7280" }}>
                Please select a bus to view Daily/Monthly visual insights.
              </div>
            )}

            {selectedBus !== "all" && analysisType === "monthly" && (
              <div style={{ margin: "12px 0" }}>
                <label style={{ fontWeight: 600 }}>
                  Select Month:&nbsp;
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </label>
              </div>
            )}

            {visualLoading && (
              <div className="chart-loading">Loading visuals...</div>
            )}

            {/* Main Visible Visual Tab */}
            {selectedBus !== "all" && (
              <div style={{ backgroundColor: "#ffffff", padding: "15px", borderRadius: "8px" }}>
                {analysisType === "daily" && dailyStats && (
                  <DailyOvercrowdStats data={dailyStats} />
                )}
                {analysisType === "monthly" && monthlyStats && (
                  <MonthlyOvercrowdStats data={monthlyStats} />
                )}

                {analysisType === "daily" && (
                  <div className="chart-section">
                    <h2 className="chart-title">Daily Overcrowd Pattern</h2>
                    <DailyOvercrowdChart data={dailyChart} />
                  </div>
                )}

                {analysisType === "monthly" && (
                  <div className="chart-section">
                    <h2 className="chart-title">Monthly Overcrowding Pattern</h2>
                    <MonthlyOvercrowdChart data={monthlyChart} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 🟢 HIDDEN GRAPH AREA FOR PDF GENERATION */}
        {selectedBus !== "all" && (
          <div style={{ position: "absolute", top: 0, left: 0, zIndex: -1000, width: "800px", opacity: 0, pointerEvents: "none" }}>
            <div id="pdf-hidden-capture-area" style={{ padding: "20px", backgroundColor: "#ffffff" }}>
              {analysisType === "daily" && dailyStats && <DailyOvercrowdStats data={dailyStats} />}
              {analysisType === "monthly" && monthlyStats && <MonthlyOvercrowdStats data={monthlyStats} />}

              {analysisType === "daily" && dailyChart.length > 0 && (
                <div style={{ width: "760px", height: "350px", marginTop: "20px" }}>
                  <h2 style={{ fontSize: "16px", marginBottom: "15px", color: "#374151" }}>Daily Overcrowd Pattern</h2>
                  <DailyOvercrowdChart data={dailyChart} />
                </div>
              )}

              {analysisType === "monthly" && monthlyChart.length > 0 && (
                <div style={{ width: "760px", height: "350px", marginTop: "20px" }}>
                  <h2 style={{ fontSize: "16px", marginBottom: "15px", color: "#374151" }}>Monthly Overcrowding Pattern</h2>
                  <MonthlyOvercrowdChart data={monthlyChart} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Occupancy;