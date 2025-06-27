import React, { useState, useEffect, useMemo, useCallback } from "react";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import { hasRole } from "../utils/roleUtils";
import ConfirmModal from "./ConfirmModal";

// Helper: CSV export
const exportToCSV = (data, filename = "medicines_export.csv") => {
  const headers = ["Name", "Batch", "Expiry", "Stock", "Reorder", "Country", "District", "Chiefdom", "Facility"];
  const rows = data.map((med) => [
    med.name, med.batchNumber, med.expiry, med.stock, med.reorderLevel,
    med.country, med.district, med.chiefdom, med.facility
  ]);
  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Reusable Filter Dropdown Component
const FilterDropdown = ({ label, value, onChange, options, disabled }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="border border-dhis2-border rounded px-2 py-1 disabled:opacity-50"
    aria-label={`Filter by ${label}`}
  >
    <option value="">{`All ${label}s`}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

// Status Indicators component
const StatusIndicators = ({ expired, closeToExpiry, lowStock }) => {
  const indicators = [];
  if (expired) indicators.push({ icon: "❌", text: "Expired", color: "text-dhis2-red-dark" });
  if (closeToExpiry && !expired) indicators.push({ icon: "⚠️", text: "Expiring Soon", color: "text-yellow-800" });
  if (lowStock) indicators.push({ icon: "🪫", text: "Low Stock", color: "text-yellow-700" });
  if (!expired && !closeToExpiry && !lowStock) indicators.push({ icon: "✔️", text: "OK", color: "text-dhis2-green-dark" });

  return (
    <>
      {indicators.map(({ icon, text, color }, i) => (
        <span key={i} title={text} className={`mr-1 ${color}`} aria-label={text} role="img">
          {icon}
        </span>
      ))}
    </>
  );
};

// Medicine Table Row component
const MedicineRow = ({
  med,
  globalIdx,
  isEditing,
  editForm,
  handleEditChange,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleDeleteClick,
  user,
  expiryThreshold,
}) => {
  const expiryDate = med.expiry ? parseISO(med.expiry) : null;
  const daysToExpiry = expiryDate && isValid(expiryDate) ? differenceInDays(expiryDate, new Date()) : null;
  const expired = daysToExpiry !== null && daysToExpiry < 0;
  const closeToExpiry = daysToExpiry !== null && daysToExpiry <= expiryThreshold && daysToExpiry >= 0;
  const lowStock = med.stock <= med.reorderLevel;

  const rowClass = expired
    ? "bg-dhis2-red-light text-dhis2-red-dark border border-dhis2-red-dark"
    : closeToExpiry
    ? "bg-yellow-100 text-yellow-800"
    : lowStock
    ? "bg-dhis2-yellow-light text-dhis2-text border border-yellow-400"
    : "bg-dhis2-green text-white";

  return (
    <tr key={globalIdx} className={rowClass}>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit medicine name"
          />
        ) : (
          med.name
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="batchNumber"
            value={editForm.batchNumber}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit batch number"
          />
        ) : (
          med.batchNumber
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            type="date"
            name="expiry"
            value={editForm.expiry || ""}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit expiry date"
          />
        ) : (
          med.expiry
        )}
      </td>
      <td className={`px-2 py-1 ${lowStock ? "text-red-600 font-semibold" : ""}`}>
        {isEditing ? (
          <input
            type="number"
            min="0"
            name="stock"
            value={editForm.stock}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit stock quantity"
          />
        ) : (
          med.stock
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            type="number"
            min="0"
            name="reorderLevel"
            value={editForm.reorderLevel}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit reorder level"
          />
        ) : (
          med.reorderLevel
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="country"
            value={editForm.country}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit country"
          />
        ) : (
          med.country
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="district"
            value={editForm.district}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit district"
          />
        ) : (
          med.district
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="chiefdom"
            value={editForm.chiefdom}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit chiefdom"
          />
        ) : (
          med.chiefdom
        )}
      </td>
      <td className="px-2 py-1">
        {isEditing ? (
          <input
            name="facility"
            value={editForm.facility}
            onChange={handleEditChange}
            className="w-full"
            disabled={!hasRole(user, "admin")}
            aria-label="Edit facility"
          />
        ) : (
          med.facility
        )}
      </td>
      <td className="px-2 py-1 text-xs text-dhis2-text" aria-live="polite">
        <StatusIndicators expired={expired} closeToExpiry={closeToExpiry} lowStock={lowStock} />
      </td>
      <td className="px-2 py-1 whitespace-nowrap">
        {isEditing ? (
          hasRole(user, "admin") ? (
            <>
              <button
                onClick={handleSaveClick}
                className="mr-2 px-2 py-1 bg-dhis2-green text-white rounded"
                aria-label="Save changes"
                type="button"
              >
                Save
              </button>
              <button
                onClick={handleCancelClick}
                className="px-2 py-1 bg-gray-400 text-white rounded"
                aria-label="Cancel edit"
                type="button"
              >
                Cancel
              </button>
            </>
          ) : (
            <span className="text-gray-500 italic">Read-only mode</span>
          )
        ) : hasRole(user, "admin") ? (
          <>
            <button
              onClick={() => handleEditClick(globalIdx)}
              className="mr-2 px-2 py-1 bg-dhis2-blue text-white rounded"
              aria-label="Edit medicine"
              type="button"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(globalIdx)}
              className="px-2 py-1 bg-red-600 text-white rounded"
              aria-label="Delete medicine"
              type="button"
            >
              Delete
            </button>
          </>
        ) : (
          <span className="text-gray-500 italic">No edit permissions</span>
        )}
      </td>
    </tr>
  );
};

// Pagination hook
const usePagination = (items, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);
  const maxPage = Math.max(1, Math.ceil(items.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [currentPage, maxPage]);

  const currentItems = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return items.slice(startIdx, startIdx + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  return { currentPage, setCurrentPage, maxPage, currentItems };
};

const MedicineTable = ({ medicines: propMedicines, setMedicines: propSetMedicines, addAuditLog, user }) => {
  // Local fallback state if props not provided
  const [localMedicines, setLocalMedicines] = useState(() => {
    if (propMedicines) return null;
    const saved = localStorage.getItem("medicines");
    return saved ? JSON.parse(saved) : [];
  });

  const medicines = propMedicines || localMedicines || [];
  const setMedicines = propSetMedicines || setLocalMedicines;

  // Sync localStorage
  useEffect(() => {
    if (!propMedicines) {
      localStorage.setItem("medicines", JSON.stringify(localMedicines));
    }
  }, [localMedicines, propMedicines]);

  // States
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterChiefdom, setFilterChiefdom] = useState("");
  const [filterFacility, setFilterFacility] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, medicineIndex: null });
  const itemsPerPage = 10;
  const expiryThreshold = 30;

  // Filters memoized options
  const countries = useMemo(() => Array.from(new Set(medicines.map((m) => m.country))).filter(Boolean), [medicines]);
  const districts = useMemo(
    () =>
      filterCountry
        ? Array.from(new Set(medicines.filter((m) => m.country === filterCountry).map((m) => m.district))).filter(Boolean)
        : [],
    [filterCountry, medicines]
  );
  const chiefdoms = useMemo(
    () =>
      filterDistrict
        ? Array.from(new Set(medicines.filter((m) => m.district === filterDistrict).map((m) => m.chiefdom))).filter(Boolean)
        : [],
    [filterDistrict, medicines]
  );
  const facilities = useMemo(
    () =>
      filterChiefdom
        ? Array.from(new Set(medicines.filter((m) => m.chiefdom === filterChiefdom).map((m) => m.facility))).filter(Boolean)
        : [],
    [filterChiefdom, medicines]
  );

  // Filter medicines
  const displayedMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const searchMatch =
        med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.facility?.toLowerCase().includes(searchTerm.toLowerCase());

      const countryMatch = filterCountry ? med.country === filterCountry : true;
      const districtMatch = filterDistrict ? med.district === filterDistrict : true;
      const chiefdomMatch = filterChiefdom ? med.chiefdom === filterChiefdom : true;
      const facilityMatch = filterFacility ? med.facility === filterFacility : true;

      const expiryDate = med.expiry ? parseISO(med.expiry) : null;
      const daysToExpiry = expiryDate && isValid(expiryDate) ? differenceInDays(expiryDate, new Date()) : null;
      const expired = daysToExpiry !== null && daysToExpiry < 0;
      const expiringSoon = daysToExpiry !== null && daysToExpiry <= expiryThreshold && daysToExpiry >= 0;
      const lowStock = med.stock <= med.reorderLevel;
      const ok = !expired && !expiringSoon && !lowStock;

      let statusMatch = true;
      if (filterStatus) {
        if (filterStatus === "expired") statusMatch = expired;
        else if (filterStatus === "expiringSoon") statusMatch = expiringSoon;
        else if (filterStatus === "lowStock") statusMatch = lowStock;
        else if (filterStatus === "ok") statusMatch = ok;
      }

      return searchMatch && countryMatch && districtMatch && chiefdomMatch && facilityMatch && statusMatch;
    });
  }, [medicines, searchTerm, filterCountry, filterDistrict, filterChiefdom, filterFacility, filterStatus]);

  // Pagination hook
  const { currentPage, setCurrentPage, maxPage, currentItems: paginatedMedicines } = usePagination(
    displayedMedicines,
    itemsPerPage
  );

  // CSV export
  const handleExportCSV = useCallback(() => {
    exportToCSV(displayedMedicines);
  }, [displayedMedicines]);

  // Editing handlers
  const handleEditClick = useCallback(
    (idx) => {
      setEditingIndex(idx);
      setEditForm(medicines[idx]);
    },
    [medicines]
  );

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!hasRole(user, "admin")) {
      toast.error("You do not have permission to edit medicines.");
      return;
    }
    const previous = medicines[editingIndex];
    const updated = medicines.map((med, i) => (i === editingIndex ? editForm : med));
    setMedicines(updated);
    setEditingIndex(null);

    toast.success("Medicine updated", {
      action: {
        label: "Undo",
        onClick: () => {
          const reverted = [...updated];
          reverted[editingIndex] = previous;
          setMedicines(reverted);
          toast.success(`${previous.name} changes reverted`);
        },
      },
    });

    addAuditLog?.({
      user,
      action: `Edited medicine ${editForm.name}`,
      timestamp: new Date().toISOString(),
    });
  }, [editForm, editingIndex, medicines, setMedicines, user, addAuditLog]);

  const handleCancelClick = useCallback(() => {
    setEditingIndex(null);
  }, []);

  // Delete handlers
  const handleDeleteClick = useCallback(
    (idx) => {
      if (!hasRole(user, "admin")) {
        toast.error("You do not have permission to delete medicines.");
        return;
      }
      setConfirmDelete({ isOpen: true, medicineIndex: idx });
    },
    [user]
  );

  const handleDeleteConfirmed = useCallback(() => {
    const idx = confirmDelete.medicineIndex;
    if (idx === null) return;
    const med = medicines[idx];
    const updated = medicines.filter((_, i) => i !== idx);
    setMedicines(updated);

    toast.success(`${med.name} deleted`, {
      action: {
        label: "Undo",
        onClick: () => {
          const restored = [...updated];
          restored.splice(idx, 0, med);
          setMedicines(restored);
          toast.success(`${med.name} restored`);
        },
      },
    });

    addAuditLog?.({
      user,
      action: `Deleted medicine ${med.name}`,
      timestamp: new Date().toISOString(),
    });

    setConfirmDelete({ isOpen: false, medicineIndex: null });
  }, [confirmDelete.medicineIndex, medicines, setMedicines, user, addAuditLog]);

  const handleDeleteCancelled = useCallback(() => {
    setConfirmDelete({ isOpen: false, medicineIndex: null });
  }, []);

  return (
    <div className="p-4">
      {/* Filters and Export */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name, batch, or facility"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-dhis2-border rounded px-2 py-1"
          aria-label="Search medicines"
        />

        <FilterDropdown label="Country" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} options={countries} />
        <FilterDropdown
          label="District"
          value={filterDistrict}
          onChange={(e) => setFilterDistrict(e.target.value)}
          options={districts}
          disabled={!filterCountry}
        />
        <FilterDropdown
          label="Chiefdom"
          value={filterChiefdom}
          onChange={(e) => setFilterChiefdom(e.target.value)}
          options={chiefdoms}
          disabled={!filterDistrict}
        />
        <FilterDropdown
          label="Facility"
          value={filterFacility}
          onChange={(e) => setFilterFacility(e.target.value)}
          options={facilities}
          disabled={!filterChiefdom}
        />

        <FilterDropdown
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { label: "Expired", value: "expired" },
            { label: "Expiring Soon", value: "expiringSoon" },
            { label: "Low Stock", value: "lowStock" },
            { label: "OK", value: "ok" },
          ].map(({ label }) => label)}
        />

        <button
          onClick={handleExportCSV}
          className="ml-auto px-3 py-1 bg-dhis2-blue text-white rounded"
          type="button"
          aria-label="Export medicines to CSV"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <table className="w-full border border-dhis2-border text-left text-sm">
        <thead className="bg-dhis2-gray-light text-dhis2-text font-semibold">
          <tr>
            {["Name", "Batch", "Expiry", "Stock", "Reorder", "Country", "District", "Chiefdom", "Facility", "Status", "Actions"].map(
              (heading) => (
                <th key={heading} className="px-2 py-1 border border-dhis2-border">
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedMedicines.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center py-4">
                No medicines found.
              </td>
            </tr>
          ) : (
            paginatedMedicines.map((med, idx) => {
              // global index in the full filtered array:
              const globalIdx = (currentPage - 1) * itemsPerPage + idx;
              return (
                <MedicineRow
                  key={globalIdx}
                  med={med}
                  globalIdx={globalIdx}
                  isEditing={editingIndex === globalIdx}
                  editForm={editForm}
                  handleEditChange={handleEditChange}
                  handleEditClick={handleEditClick}
                  handleSaveClick={handleSaveClick}
                  handleCancelClick={handleCancelClick}
                  handleDeleteClick={handleDeleteClick}
                  user={user}
                  expiryThreshold={expiryThreshold}
                />
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-3 flex justify-center items-center gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
          aria-label="Previous page"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {maxPage}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(maxPage, p + 1))}
          disabled={currentPage >= maxPage}
          className="px-3 py-1 border rounded disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete medicine "${medicines[confirmDelete.medicineIndex]?.name}"?`}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancelled}
      />
    </div>
  );
};

export default MedicineTable;