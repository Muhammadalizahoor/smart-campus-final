"use client";

import { useEffect, useState, useRef } from "react";
import { firestore } from "../services/firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import "../styles/admindashboard-charts.css";

export default function Charts() {

  /* =====================================================
     BAR CHART (EXACT SAME – NO CHANGE)
  ===================================================== */
  const [busData, setBusData] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const busesSnapshot = await getDocs(collection(firestore, "buses"));
        const buses = busesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const occupancySnapshot = await getDocs(collection(firestore, "occupancy_events"));
        const occupancyEvents = occupancySnapshot.docs.map(doc => doc.data());

        const todayStr = new Date().toISOString().split("T")[0];
        const eventsToday = occupancyEvents.filter(ev => ev.date === todayStr);

        const data = buses.map(bus => {
          const busEvents = eventsToday.filter(ev => ev.busId === bus.busId);
          const totalPassengers = busEvents.reduce(
            (acc, ev) => acc + (ev.currentPassengers || 0),
            0
          );

          return {
            busId: bus.busId,
            routeId: bus.routeId || "N/A",
            passengers: totalPassengers,
            documentsCount: busEvents.length,
          };
        });

        setBusData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  const chartWidth = 600;
  const chartHeight = 300;
  const barWidth = 40;
  const gap = 30;
  const yAxisPadding = 50;
  const topPadding = 40;
  const bottomPadding = 30;
  const chartAreaHeight = chartHeight - topPadding - bottomPadding;
  const maxChartValue = 100;

  /* =====================================================
     COMPLAINT DONUT (COPIED 100% FROM ORIGINAL chart.jsx)
  ===================================================== */
  const [complaintStats, setComplaintStats] = useState({
    Pending: 0,
    Resolved: 0,
    "In Progress": 0,
    Dismissed: 0,
    total: 0,
  });

  const donutRef = useRef(null);
  const donutTooltipRef = useRef({ visible: false, text: "", color: "", x: 0, y: 0 });
  const [donutTooltip, setDonutTooltip] = useState(donutTooltipRef.current);

  const statuses = ["Resolved", "In Progress", "Pending", "Dismissed"];
  const colors = ["#2BC9E5", "#FF6A92", "#F79631", "#583CBE"];

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "complaints"), (snapshot) => {
      const stats = { Pending: 0, Resolved: 0, "In Progress": 0, Dismissed: 0, total: 0 };
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status in stats) stats[data.status]++;
        stats.total++;
      });
      setComplaintStats(stats);
    });

    return () => unsub();
  }, []);

  return (
    <div className="charts-grid">

      {/* ================= BAR CHART ================= */}
      <div className="chart-card">
        <h3 className="chart-title2">Occupancy Trends</h3>
        <p className="chart-subtitle2">Today's passengers by bus</p>

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map(value => {
            const yPos = topPadding + chartAreaHeight * (1 - value / maxChartValue);
            return (
              <g key={value}>
                <line
                  x1={yAxisPadding}
                  y1={yPos}
                  x2={chartWidth - 20}
                  y2={yPos}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
                <text
                  x={yAxisPadding - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {busData.map((bus, index) => {
            const barHeight = Math.min(bus.passengers / maxChartValue, 1) * chartAreaHeight;
            const x = yAxisPadding + index * (barWidth + gap) + gap / 2;
            const y = topPadding + (chartAreaHeight - barHeight);

            return (
              <g key={bus.busId}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGradient)"
                  onMouseEnter={(e) => {
                    const svg = e.currentTarget.ownerSVGElement;
                    const pt = svg.createSVGPoint();
                    pt.x = e.clientX;
                    pt.y = e.clientY;
                    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
                    setTooltip({
                      visible: true,
                      x: p.x,
                      y: p.y,
                      content: `👤 ${bus.passengers} Passengers\nRoute: ${bus.routeId}`,
                    });
                  }}
                  onMouseLeave={() => setTooltip({ visible: false })}
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#1e3a5f"
                >
                  {bus.busId}
                </text>
              </g>
            );
          })}

          {tooltip.visible && (
            <g pointerEvents="none">
              <rect
                x={tooltip.x - 60}
                y={tooltip.y - 35}
                width={150}
                height={45}
                rx={6}
                fill="rgba(0,0,0,0.7)"
              />
              <text
                x={tooltip.x}
                y={tooltip.y - 15}
                fill="#fff"
                fontSize="12"
                textAnchor="middle"
              >
                {tooltip.content.split("\n").map((line, i) => (
                  <tspan key={i} x={tooltip.x} dy={i === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ================= COMPLAINT DONUT ================= */}
      <div className="chart-card complaint-card">
        <h3 className="chart-title1">Complaint Summary</h3>
        <p className="chart-subtitle1">Status-wise complaint count</p>

        <div className="donut-chart" ref={donutRef}>
          <svg viewBox="0 0 120 120" className="donut-svg">
            {statuses.map((status, idx) => {
              const count = complaintStats[status] || 0;
              const total = complaintStats.total || 1;
              const dash = (count / total) * 314;
              const offset = statuses
                .slice(0, idx)
                .reduce((acc, s) => acc + ((complaintStats[s] || 0) / total) * 314, 0);

              return (
                <circle
                  key={status}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={colors[idx]}
                  strokeWidth="15"
                  strokeDasharray={`${dash} ${314 - dash}`}
                  strokeDashoffset={`-${offset}`}
                  onMouseEnter={(e) => {
                    const rect = donutRef.current.getBoundingClientRect();
                    setDonutTooltip({
                      visible: true,
                      text: `${status}: ${count}`,
                      color: colors[idx],
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = donutRef.current.getBoundingClientRect();
                    setDonutTooltip(prev => ({
                      ...prev,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    }));
                  }}
                  onMouseLeave={() =>
                    setDonutTooltip({ visible: false, text: "", color: "", x: 0, y: 0 })
                  }
                />
              );
            })}

            <text x="60" y="50" textAnchor="middle" fill="#6b7280" fontSize="7">
              Total Complaints
            </text>
            <text x="60" y="70" textAnchor="middle" fill="#1e3a5f" fontSize="18" fontWeight="bold">
              {complaintStats.total}
            </text>
          </svg>

          {donutTooltip.visible && (
            <div
              className="tooltip"
              style={{
                top: donutTooltip.y + 10,
                left: donutTooltip.x + 10,
                borderColor: donutTooltip.color,
              }}
            >
              <span
                className="tooltip-icon"
                style={{ backgroundColor: donutTooltip.color }}
              ></span>
              {donutTooltip.text}
            </div>
          )}

          <div className="donut-legend">
            {statuses.map((status, idx) => (
              <div className="legend-item" key={status}>
                <span
                  className="legend-color"
                  style={{ backgroundColor: colors[idx] }}
                ></span>
                {status}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
