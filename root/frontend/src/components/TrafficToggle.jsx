// TrafficToggle.jsx
// Simple radio buttons to set mock traffic state

import React from "react";

const TrafficToggle = ({ value, onToggle }) => {
  return (
    <div className="traffic-toggle">
      <label>Traffic</label>
      <div>
        <label>
          <input type="radio" checked={value === "Smooth"} onChange={() => onToggle("Smooth")} />
          Smooth
        </label>
        <label>
          <input type="radio" checked={value === "Moderate"} onChange={() => onToggle("Moderate")} />
          Moderate
        </label>
        <label>
          <input type="radio" checked={value === "Heavy"} onChange={() => onToggle("Heavy")} />
          Heavy
        </label>
      </div>
    </div>
  );
};

export default TrafficToggle;
