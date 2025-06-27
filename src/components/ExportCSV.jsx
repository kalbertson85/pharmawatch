// src/components/ExportCSV.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { saveAs } from "file-saver";

const ExportCSV = () => {
  const [medicines, setMedicines] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUsername(userData.username || "User");

    const storedMeds = JSON.parse(localStorage.getItem("medicines")) || [];
    setMedicines(storedMeds);
  }, []);

  const exportToCSV = () => {
    if (medicines.length === 0) {
      alert("No medicines to export.");
      return;
    }

    const headers = [
      "Name",
      "Expiry",
      "Stock",
      "Reorder Level",
      "Country",
      "Province",
      "District",
      "Facility",
    ];

    const csvRows = [
      headers.join(","),
      ...medicines.map((m) =>
        [
          `"${m.name}"`,
          m.expiry,
          m.stock,
          m.reorderLevel,
          `"${m.country}"`,
          `"${m.province}"`,
          `"${m.district}"`,
          `"${m.facility}"`,
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "pharmawatch_medicines.csv");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-6">
        <h2 className="text-2xl font-bold mb-4">Export Medicines CSV</h2>
        <p className="mb-6 text-sm text-gray-600">
          Logged in as <span className="font-medium">{username}</span>
        </p>

        <button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Export Medicines to CSV
        </button>
      </div>
    </Layout>
  );
};

export default ExportCSV;