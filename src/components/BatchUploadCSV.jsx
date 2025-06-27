import React, { useState } from "react";
import Papa from "papaparse";

const BatchUploadCSV = ({ onUpload }) => {
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Basic required fields for validation
  const requiredFields = ["name", "batchNumber", "expiry", "stock", "reorderLevel", "country", "district", "chiefdom", "facility"];

  const validateRow = (row) => {
    // Check all required fields exist and are not empty
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === "") {
        return `Missing or empty field "${field}" in a row.`;
      }
    }
    // Additional validations
    if (isNaN(Number(row.stock))) return "Stock must be a number.";
    if (isNaN(Number(row.reorderLevel))) return "Reorder level must be a number.";
    if (isNaN(Date.parse(row.expiry))) return "Expiry must be a valid date.";

    return null; // no error
  };

  const handleFile = (e) => {
    setError(null);
    setPreviewData(null);
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setError("Failed to parse CSV: " + results.errors[0].message);
          return;
        }

        // Validate each row
        for (const row of results.data) {
          const errMsg = validateRow(row);
          if (errMsg) {
            setError(errMsg);
            return;
          }
        }

        setPreviewData(results.data);
      },
      error: (err) => {
        setError("Error reading file: " + err.message);
      },
    });
  };

  const handleConfirmUpload = () => {
    if (previewData) {
      onUpload(previewData);
      setPreviewData(null);
      setError(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow border border-dhis2-gray-light max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-3">Batch Upload Medicines (CSV)</h3>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="mb-3"
      />
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {previewData && (
        <>
          <p className="mb-2 text-sm">Preview: {previewData.length} rows ready to upload.</p>
          <button
            onClick={handleConfirmUpload}
            className="bg-dhis2-blue text-white px-3 py-1 rounded hover:bg-dhis2-blueDark"
          >
            Confirm Upload
          </button>
        </>
      )}
    </div>
  );
};

export default BatchUploadCSV;