import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { getStatusFlags } from "../utils/medicineUtils";

const COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#FF0000"];

const MedicineAnalytics = ({ medicines }) => {
  const summaryData = useMemo(() => {
    let expiredCount = 0,
      lowStockCount = 0,
      expiringSoonCount = 0,
      goodCount = 0;

    medicines.forEach((med) => {
      const { expired, lowStock, expiringSoon } = getStatusFlags(med);

      if (expired) expiredCount++;
      else if (lowStock) lowStockCount++;
      else if (expiringSoon) expiringSoonCount++;
      else goodCount++;
    });

    return [
      { name: "Expired", value: expiredCount },
      { name: "Low Stock", value: lowStockCount },
      { name: "Expiring Soon", value: expiringSoonCount },
      { name: "Good", value: goodCount },
    ];
  }, [medicines]);

  const barData = useMemo(() => {
    const grouped = {};
    medicines.forEach((med) => {
      const key = med.name;
      grouped[key] = (grouped[key] || 0) + med.stock;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-dhis2-blue mb-4">Medicine Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-medium text-dhis2-text mb-2">Stock Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-medium text-dhis2-text mb-2">Stock by Medicine</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MedicineAnalytics;