"use client";
import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import StatsCards from "./StatsCards";
import DashboardSection from "../components/DashboardSection"; // welcome + alerts combined
//import GoogleMapSection from "../components/GoogleMap";        
import DashboardLiveMap from "../components/DashboardLiveMap";  // live map here
 
import Charts from "./Charts";
import "../styles/admin-layout.css";

function AdminPortal() {
  return (
    <>
      <Header />
      <Sidebar />

      <div className="admin-content-wrapper">

        {/* KPI CARDS */}
        <StatsCards />

        {/* WELCOME + ALERTS */}
        <DashboardSection />

        {/* GOOGLE MAP BELOW */}
        <div className="dashboard-map">
         {/*  <GoogleMapSection /> */}
         <DashboardLiveMap />
        </div>
        
         {/* CHARTS BELOW MAP */}
        <div className="dashboard-charts-wrapper">
          <Charts />
        </div>

      </div>
    </>
  );
}

export default AdminPortal;
