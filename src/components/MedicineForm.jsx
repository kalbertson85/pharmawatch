import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import LocationDropdowns from "../components/LocationDropdowns";
import { medicineOptions } from "../data/medicineOptions";

const DRAFT_STORAGE_KEY = "medicineFormDraft";

const initialForm = {
  name: "",
  customMedicine: "",
  batchNumber: "",
  expiry: "",
  stock: "",
  reorderLevel: "",
  consumed: "", // new field
  country: "Sierra Leone",
  district: "",
  chiefdom: "",
  facility: "",
};

const MedicineForm = ({
  medicines: propMedicines,
  setMedicines: propSetMedicines,
  addAuditLog,
  user,
  editingMedicine = null,
  clearEditingMedicine,
}) => {
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6 text-center text-red-600 font-semibold">
        Access Denied. You do not have permission to add or edit medicines.
      </div>
    );
  }

  // Local medicines state fallback if props not provided
  const [medicines, setMedicines] = useState(() => {
    if (propMedicines) return propMedicines;
    const saved = localStorage.getItem("medicines");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync local medicines state if propMedicines changes
  useEffect(() => {
    if (propMedicines) {
      setMedicines(propMedicines);
    }
  }, [propMedicines]);

  const updateMedicines = (updatedList) => {
    if (propSetMedicines) {
      propSetMedicines(updatedList);
    } else {
      setMedicines(updatedList);
    }
  };

  // Persist local medicines to localStorage if no propSetMedicines
  useEffect(() => {
    if (!propSetMedicines) {
      localStorage.setItem("medicines", JSON.stringify(medicines));
    }
  }, [medicines, propSetMedicines]);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!editingMedicine) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setForm(draftData);
        } catch {}
      }
    }
  }, [editingMedicine]);

  useEffect(() => {
    if (editingMedicine) {
      const isKnown = medicineOptions.includes(editingMedicine.name);
      setForm({
        name: isKnown ? editingMedicine.name : "Other",
        customMedicine: isKnown ? "" : editingMedicine.name,
        batchNumber: editingMedicine.batchNumber || "",
        expiry: editingMedicine.expiry || "",
        stock: editingMedicine.stock || "",
        reorderLevel: editingMedicine.reorderLevel || "",
        consumed: editingMedicine.consumed ?? "",
        country: editingMedicine.country || "Sierra Leone",
        district: editingMedicine.district || "",
        chiefdom: editingMedicine.chiefdom || "",
        facility: editingMedicine.facility || "",
      });
      setErrors({});
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      setForm(initialForm);
      setErrors({});
    }
  }, [editingMedicine]);

  const validateForm = (data) => {
    const newErrors = {};
    const medName = data.name === "Other" ? data.customMedicine : data.name;

    if (!medName.trim()) newErrors.name = "Medicine name is required.";
    if (!data.batchNumber.trim()) newErrors.batchNumber = "Batch number is required.";
    if (!data.expiry || isNaN(Date.parse(data.expiry))) {
      newErrors.expiry = "Valid expiry date is required.";
    }
    if (data.stock === "" || Number(data.stock) < 0) newErrors.stock = "Stock must be 0 or more.";
    if (data.reorderLevel === "" || Number(data.reorderLevel) < 0) newErrors.reorderLevel = "Reorder level must be 0 or more.";

    if (!data.country) newErrors.country = "Country is required.";
    if (!data.district) newErrors.district = "District is required.";
    if (!data.chiefdom) newErrors.chiefdom = "Chiefdom is required.";
    if (!data.facility) newErrors.facility = "Facility is required.";

    return newErrors;
  };

  useEffect(() => {
    setErrors(validateForm(form));
  }, [form]);

  useEffect(() => {
    if (!editingMedicine) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
    }
  }, [form, editingMedicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (updatedFilters) => {
    setForm((prev) => ({ ...prev, ...updatedFilters }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors.");
      return;
    }

    const medName = form.name === "Other" ? form.customMedicine : form.name;
    const medicineData = {
      ...form,
      name: medName,
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
      consumed: form.consumed !== "" ? Number(form.consumed) : 0,
    };

    if (editingMedicine) {
      const updatedList = medicines.map((med) =>
        med.batchNumber === editingMedicine.batchNumber ? medicineData : med
      );
      updateMedicines(updatedList);

      addAuditLog({
        action: "UPDATE",
        medicineName: medName,
        user: user?.username || "Unknown",
        timestamp: new Date().toISOString(),
        details: medicineData,
      });
      toast.success(`Medicine "${medName}" updated.`);
      clearEditingMedicine();
    } else {
      updateMedicines([...medicines, medicineData]);

      addAuditLog({
        action: "ADD",
        medicineName: medName,
        user: user?.username || "Unknown",
        timestamp: new Date().toISOString(),
        details: medicineData,
      });
      toast.success(`Medicine "${medName}" added.`);
    }

    setForm(initialForm);
    setErrors({});
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const handleCancelEdit = () => {
    clearEditingMedicine();
    setForm(initialForm);
    setErrors({});
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const isSubmitDisabled = Object.keys(errors).length > 0;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6 sm:p-8 md:p-10">
      <h2 className="text-dhis2-blue text-2xl font-semibold mb-6 text-center md:text-left">
        {editingMedicine ? "Edit Medicine" : "Add Medicine"}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Medicine Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-2 font-semibold text-sm">Medicine Name</label>
          <select
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`border p-2 rounded text-sm focus:outline-none ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Select Medicine --</option>
            {medicineOptions.map((med, i) => (
              <option key={i} value={med}>{med}</option>
            ))}
            <option value="Other">Other</option>
          </select>
          {form.name === "Other" && (
            <input
              type="text"
              name="customMedicine"
              placeholder="Enter medicine name"
              value={form.customMedicine}
              onChange={handleChange}
              className="mt-2 border p-2 rounded text-sm"
              required
            />
          )}
          {errors.name && <span className="text-red-600 text-xs mt-1">{errors.name}</span>}
        </div>

        {/* Batch Number */}
        <div className="flex flex-col">
          <label htmlFor="batchNumber" className="mb-2 font-semibold text-sm">Batch Number</label>
          <input
            type="text"
            id="batchNumber"
            name="batchNumber"
            value={form.batchNumber}
            onChange={handleChange}
            disabled={!!editingMedicine}
            className={`border p-2 rounded text-sm ${
              errors.batchNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.batchNumber && <span className="text-red-600 text-xs mt-1">{errors.batchNumber}</span>}
        </div>

        {/* Expiry Date */}
        <div className="flex flex-col">
          <label htmlFor="expiry" className="mb-2 font-semibold text-sm">Expiry Date</label>
          <input
            type="date"
            id="expiry"
            name="expiry"
            value={form.expiry}
            onChange={handleChange}
            className={`border p-2 rounded text-sm ${
              errors.expiry ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.expiry && <span className="text-red-600 text-xs mt-1">{errors.expiry}</span>}
        </div>

        {/* Stock */}
        <div className="flex flex-col">
          <label htmlFor="stock" className="mb-2 font-semibold text-sm">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            className={`border p-2 rounded text-sm ${
              errors.stock ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.stock && <span className="text-red-600 text-xs mt-1">{errors.stock}</span>}
        </div>

        {/* Reorder Level */}
        <div className="flex flex-col">
          <label htmlFor="reorderLevel" className="mb-2 font-semibold text-sm">Reorder Level</label>
          <input
            type="number"
            id="reorderLevel"
            name="reorderLevel"
            value={form.reorderLevel}
            onChange={handleChange}
            min="0"
            className={`border p-2 rounded text-sm ${
              errors.reorderLevel ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.reorderLevel && <span className="text-red-600 text-xs mt-1">{errors.reorderLevel}</span>}
        </div>

        {/* Consumed - Admin only */}
        {user?.role === "admin" && (
          <div className="flex flex-col">
            <label htmlFor="consumed" className="mb-2 font-semibold text-sm">Units Consumed</label>
            <input
              type="number"
              id="consumed"
              name="consumed"
              value={form.consumed}
              onChange={handleChange}
              min="0"
              className="border p-2 rounded text-sm border-gray-300"
            />
          </div>
        )}

        {/* Location Fields */}
        <div className="sm:col-span-2">
          <LocationDropdowns
            filters={{
              country: form.country,
              district: form.district,
              chiefdom: form.chiefdom,
              facility: form.facility,
            }}
            setFilters={handleLocationChange}
            errors={errors}
          />
        </div>

        {/* Action Buttons */}
        <div className="sm:col-span-2 flex justify-end gap-4 mt-4">
          {editingMedicine && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`px-4 py-2 rounded text-white ${
              isSubmitDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingMedicine ? "Update Medicine" : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;