"use client";

import React from "react";
import WelcomeCard from "../pages/WelcomeCard";
import ActiveAlerts from "./ActiveAlerts";
import "../styles/dashboard-two-column.css";

export default function DashboardSection() {
  return (
    <div className="two-col-wrapper">
      <div className="left-col">
        <WelcomeCard />
      </div>

      <div className="right-col">
        <ActiveAlerts />
      </div>
    </div>
  );
}
