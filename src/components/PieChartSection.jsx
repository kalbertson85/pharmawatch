import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  Expired: "#d32f2f",
  Valid: "#2e7d32",
};

const PieChartSection = ({ medicines, chartFilters, setChartFilters }) => {
  const total = medicines.length;
  const expired = medicines.filter((m) => new Date(m.expiry) < new Date()).length;
  const valid = total - expired;

  // Filter data by visible chartFilters
  const filteredData = [
    ...(chartFilters.expired ? [{ name: "Expired", value: expired }] : []),
    ...(chartFilters.valid ? [{ name: "Valid", value: valid }] : []),
  ];

  const visibleTotal = filteredData.reduce((sum, entry) => sum + entry.value, 0);

  const dataWithPercent = filteredData.map((entry) => ({
    ...entry,
    percent: visibleTotal === 0 ? 0 : entry.value / visibleTotal,
  }));

  // 🔧 FIX: prevent toggling off both slices
  const handleLegendClick = (entry) => {
    const key = entry.value.toLowerCase();
    setChartFilters((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      if (!newState.expired && !newState.valid) {
        return prev; // Don't allow both off
      }
      return newState;
    });
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    name,
    value,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        aria-label={`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
      >
        {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, percent } = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded shadow p-2 text-sm">
          <p className="font-semibold text-dhis2-text">{name}</p>
          <p>Count: {value}</p>
          <p>Percentage: {(percent * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-md mx-auto w-full border border-dhis2-gray-light">
      <h3 className="text-lg font-semibold mb-4 text-center text-dhis2-text">
        Expired vs Valid Medicines
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithPercent}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={renderCustomizedLabel}
            isAnimationActive={false}
          >
            {dataWithPercent.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
                opacity={chartFilters[entry.name.toLowerCase()] ? 1 : 0.3}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            onClick={handleLegendClick}
            wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
            iconType="circle"
            payload={["Expired", "Valid"].map((name) => ({
              value: name,
              type: "circle",
              id: name,
              color: COLORS[name],
            }))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartSection;