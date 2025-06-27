// src/components/HeatmapGridSection.jsx
import React from "react";

// Simple heatmap grid by facility stock count intensity
const HeatmapGridSection = ({ medicines }) => {
  // Aggregate stock by facility
  const facilityStocks = medicines.reduce((acc, med) => {
    acc[med.facility] = (acc[med.facility] || 0) + med.stock;
    return acc;
  }, {});

  // Calculate max stock for intensity scaling
  const maxStock = Math.max(...Object.values(facilityStocks), 1);

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-dhis2-border max-w-4xl mx-auto w-full">
      <h3 className="text-xl font-semibold mb-4 text-center text-dhis2-text">
        🔥 Stock Intensity Heatmap by Facility
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(facilityStocks).map(([facility, stock]) => {
          // Intensity color scale: green low → red high
          const intensity = Math.min(1, stock / maxStock);
          const red = Math.floor(255 * intensity);
          const green = Math.floor(128 * (1 - intensity));
          const bgColor = `rgba(${red},${green},0,0.7)`;
          return (
            <div
              key={facility}
              className="text-white rounded p-3 text-center font-semibold"
              style={{ backgroundColor: bgColor }}
              title={`Stock: ${stock}`}
            >
              {facility}
              <br />
              <span className="text-sm font-normal">{stock} units</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeatmapGridSection;