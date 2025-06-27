import React, { useState, useEffect } from "react";
import {
  SingleSelect,
  SingleSelectOption,
  InputField,
  Button,
  NoticeBox,
  Field,
} from "@dhis2/ui";
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
      <NoticeBox error>
        Access Denied. You do not have permission to add or edit medicines.
      </NoticeBox>
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
    if (data.reorderLevel === "" || Number(data.reorderLevel) < 0)
      newErrors.reorderLevel = "Reorder level must be 0 or more.";

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

  const handleChange = (name, value) => {
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
        <Field label="Medicine Name" error={!!errors.name} required>
          <SingleSelect
            selected={form.name}
            onChange={({ selected }) => handleChange("name", selected)}
            dataTest="medicine-name-select"
          >
            <SingleSelectOption label="-- Select Medicine --" value="" />
            {medicineOptions.map((med) => (
              <SingleSelectOption key={med} label={med} value={med} />
            ))}
            <SingleSelectOption label="Other" value="Other" />
          </SingleSelect>
          {form.name === "Other" && (
            <InputField
              label="Custom Medicine Name"
              value={form.customMedicine}
              onChange={({ value }) => handleChange("customMedicine", value)}
              required
              error={!!errors.name}
            />
          )}
          {errors.name && (
            <NoticeBox error dense>
              {errors.name}
            </NoticeBox>
          )}
        </Field>

        {/* Batch Number */}
        <Field label="Batch Number" error={!!errors.batchNumber} required>
          <InputField
            value={form.batchNumber}
            onChange={({ value }) => handleChange("batchNumber", value)}
            disabled={!!editingMedicine}
            error={!!errors.batchNumber}
          />
          {errors.batchNumber && (
            <NoticeBox error dense>
              {errors.batchNumber}
            </NoticeBox>
          )}
        </Field>

        {/* Expiry Date */}
        <Field label="Expiry Date" error={!!errors.expiry} required>
          <InputField
            type="date"
            value={form.expiry}
            onChange={({ value }) => handleChange("expiry", value)}
            error={!!errors.expiry}
          />
          {errors.expiry && (
            <NoticeBox error dense>
              {errors.expiry}
            </NoticeBox>
          )}
        </Field>

        {/* Stock */}
        <Field label="Stock" error={!!errors.stock} required>
          <InputField
            type="number"
            min="0"
            value={form.stock}
            onChange={({ value }) => handleChange("stock", value)}
            error={!!errors.stock}
          />
          {errors.stock && (
            <NoticeBox error dense>
              {errors.stock}
            </NoticeBox>
          )}
        </Field>

        {/* Reorder Level */}
        <Field label="Reorder Level" error={!!errors.reorderLevel} required>
          <InputField
            type="number"
            min="0"
            value={form.reorderLevel}
            onChange={({ value }) => handleChange("reorderLevel", value)}
            error={!!errors.reorderLevel}
          />
          {errors.reorderLevel && (
            <NoticeBox error dense>
              {errors.reorderLevel}
            </NoticeBox>
          )}
        </Field>

        {/* Consumed - Admin only */}
        {user?.role === "admin" && (
          <Field label="Units Consumed">
            <InputField
              type="number"
              min="0"
              value={form.consumed}
              onChange={({ value }) => handleChange("consumed", value)}
            />
          </Field>
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
            <Button secondary onClick={handleCancelEdit} dataTest="cancel-button">
              Cancel
            </Button>
          )}
          <Button
            primary
            disabled={isSubmitDisabled}
            type="submit"
            dataTest="submit-button"
          >
            {editingMedicine ? "Update Medicine" : "Add Medicine"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;