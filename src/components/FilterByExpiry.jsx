// src/components/FilterByExpiry.jsx
import React from "react";

const FilterByExpiry = ({ medicines, onFilter }) => {
  // Compute counts by expiry status
  const total = medicines.length;
  const expired = medicines.filter(m => new Date(m.expiry) < new Date()).length;
  const expiringSoon = medicines.filter(m => {
    const expiryDate = new Date(m.expiry);
    const today = new Date();
    const diff = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const handleChange = (e) => {
    onFilter(e.target.value);
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      <label htmlFor="expiryFilter" className="font-semibold">
        Filter by Expiry:
      </label>
      <select
        id="expiryFilter"
        onChange={handleChange}
        className="border rounded px-3 py-1"
        defaultValue="all"
      >
        <option value="all">All ({total})</option>
        <option value="expired">Expired ({expired})</option>
        <option value="expiringSoon">Expiring Soon (30 days) ({expiringSoon})</option>
        <option value="valid">Valid (Not Expired) ({total - expired})</option>
      </select>
    </div>
  );
};

export default FilterByExpiry;