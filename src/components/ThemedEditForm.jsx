import React, { useState, useEffect } from "react";

const ThemedEditForm = ({ formData, onChange, onSave, onCancel }) => {
  // Local state to track validation errors
  const [errors, setErrors] = useState({});

  // Validate all fields and update errors state
  const validate = (data) => {
    const newErrors = {};

    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Name is required";
    }
    if (!data.batchNumber || data.batchNumber.trim() === "") {
      newErrors.batchNumber = "Batch Number is required";
    }
    if (!data.expiry) {
      newErrors.expiry = "Expiry Date is required";
    } else {
      const expiryDate = new Date(data.expiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ignore time
      if (expiryDate < today) {
        newErrors.expiry = "Expiry Date cannot be in the past";
      }
    }
    if (data.stock === "" || data.stock === null || data.stock === undefined) {
      newErrors.stock = "Stock is required";
    } else if (isNaN(data.stock) || Number(data.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }
    if (data.reorderLevel !== "" && data.reorderLevel !== null && data.reorderLevel !== undefined) {
      if (isNaN(data.reorderLevel) || Number(data.reorderLevel) < 0) {
        newErrors.reorderLevel = "Reorder Level must be a non-negative number";
      }
    }

    return newErrors;
  };

  // Run validation when formData changes
  useEffect(() => {
    setErrors(validate(formData));
  }, [formData]);

  // Whether the form is valid (no errors)
  const isValid = Object.keys(errors).length === 0;

  // Helper to generate input id to link with label
  const getInputId = (name) => `editform-input-${name}`;

  return (
    <div className="mt-6 p-6 bg-white border border-dhis2-border rounded-lg shadow-md max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-dhis2-text mb-4">Edit Medicine</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Name", name: "name" },
          { label: "Batch Number", name: "batchNumber" },
          { label: "Expiry Date", name: "expiry", type: "date" },
          { label: "Stock", name: "stock", type: "number" },
          { label: "Reorder Level", name: "reorderLevel", type: "number" },
          { label: "Country", name: "country" },
          { label: "District", name: "district" },
          { label: "Chiefdom", name: "chiefdom" },
          { label: "Facility", name: "facility" }
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label
              htmlFor={getInputId(name)}
              className="block text-xs font-medium text-dhis2-text mb-1"
            >
              {label}
            </label>
            <input
              id={getInputId(name)}
              type={type}
              name={name}
              value={formData[name] || ""}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-xs
                ${
                  errors[name]
                    ? "border-red-600 focus:ring-red-600"
                    : "border-dhis2-border focus:ring-dhis2-blue"
                }`}
            />
            {errors[name] && (
              <p className="mt-1 text-red-600 text-[10px] font-semibold">{errors[name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-dhis2-text border border-dhis2-border rounded hover:bg-gray-200 text-xs"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className={`px-4 py-2 rounded text-xs text-white focus:outline-none focus:ring-2
            ${
              isValid
                ? "bg-dhis2-blue hover:bg-dhis2-blue-dark focus:ring-dhis2-blue"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={!isValid}
          type="button"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ThemedEditForm;