// src/components/LineChartSection.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock time-series stock data for each medicine
// For demo, generate last 6 months with random stock values
const generateMockTimeSeries = (medicineName) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, idx) => ({
    month,
    stock: Math.floor(50 + Math.random() * 100),
    medicine: medicineName,
  }));
};

const LineChartSection = ({ medicines }) => {
  // Flatten data: multiple medicines with stock by month
  const data = medicines.length
    ? generateMockTimeSeries(medicines[0].name)
    : [];

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-dhis2-border max-w-4xl mx-auto w-full">
      <h3 className="text-xl font-semibold mb-4 text-center text-dhis2-text">
        📈 Stock Trends (Last 6 months) - {medicines[0]?.name || "N/A"}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="stock"
            stroke="#1976d2"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartSection;