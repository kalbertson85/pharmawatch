// src/components/BarChartSection.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const BarChartSection = ({ medicines }) => {
  // Prepare data for the chart
  const data = medicines.map((m) => ({
    name: m.name,
    stock: m.stock,
    reorderLevel: m.reorderLevel || 0,
  }));

  // Custom tooltip to show medicine name and values for stock and reorderLevel
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded shadow-sm p-2 text-sm text-dhis2-text">
          <p className="font-semibold text-dhis2-text">
            {payload[0].payload.name}
          </p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm text-dhis2-text">
              {`${item.name}: ${item.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-6xl mx-auto w-full border border-dhis2-border">
      <h3 className="text-xl font-semibold mb-4 text-center text-dhis2-text">
        📊 Stock vs Reorder Level per Medicine
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="stock" fill="#2e7d32" name="Stock" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="stock" position="top" fontSize={10} />
          </Bar>
          <Bar
            dataKey="reorderLevel"
            fill="#f57c00"
            name="Reorder Level"
            radius={[4, 4, 0, 0]}
          >
            <LabelList dataKey="reorderLevel" position="top" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartSection;