import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";
import FiltersPanel from "./FiltersPanel";
import MedicineRow from "./MedicineRow";
import Pagination from "./Pagination";
import useFilteredMedicines from "../hooks/useFilteredMedicines";
import { hasRole } from "../utils/roleUtils";

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const itemsPerPage = 15;

const MedicineTable = ({
  medicines: propMedicines,
  setMedicines: propSetMedicines,
  addAuditLog,
  user,
}) => {
  // Controlled medicines state from props only, no local duplication
  const medicines = propMedicines;

  // Filters and search states
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [filterCountry, setFilterCountry] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterChiefdom, setFilterChiefdom] = useState(null);
  const [filterFacility, setFilterFacility] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  // Pagination and editing state
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState(null);

  // Edit form data
  const [editForm, setEditForm] = useState({});

  // Confirm delete modal
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    medicineIndex: null,
  });

  // Async loading / error states simulation (if applicable)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter medicines with custom hook and debounced search term
  const filteredMedicines = useFilteredMedicines({
    medicines,
    searchTerm: debouncedSearchTerm,
    filterCountry,
    filterDistrict,
    filterChiefdom,
    filterFacility,
    filterStatus,
  });

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  // Reset current page to 1 if filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    filterCountry,
    filterDistrict,
    filterChiefdom,
    filterFacility,
    filterStatus,
  ]);

  // Adjust currentPage if out of bounds after filtering
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Slice medicines for current page
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, currentPage]);

  // Reset editing index if paginated medicines shrink or current index invalid
  useEffect(() => {
    if (editingIndex !== null && editingIndex >= paginatedMedicines.length) {
      setEditingIndex(null);
      setEditForm({});
    }
  }, [editingIndex, paginatedMedicines.length]);

  // Utility to build edit form from medicine
  const buildEditForm = (med) => ({
    name: med.name || "",
    batchNumber: med.batchNumber || "",
    expiry: med.expiry || "",
    stock: med.stock ?? 0,
    reorderLevel: med.reorderLevel ?? 0,
    country: med.country || "",
    district: med.district || "",
    chiefdom: med.chiefdom || "",
    facility: med.facility || "",
  });

  // Edit handlers
  const handleEditClick = useCallback(
    (index) => {
      const med = paginatedMedicines[index];
      if (!med) return;
      setEditingIndex(index);
      setEditForm(buildEditForm(med));
    },
    [paginatedMedicines]
  );

  const handleCancelClick = useCallback(() => {
    setEditingIndex(null);
    setEditForm({});
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value } = e.target;
    // Parse numeric inputs
    const val =
      name === "stock" || name === "reorderLevel"
        ? Number(value)
        : value;
    setEditForm((f) => ({ ...f, [name]: val }));
  }, []);

  // Basic validation: name and batchNumber required; stock, reorderLevel >=0; expiry valid date or empty
  const validateForm = (form) => {
    if (!form.name.trim()) {
      toast.error("Medicine name is required");
      return false;
    }
    if (!form.batchNumber.trim()) {
      toast.error("Batch number is required");
      return false;
    }
    if (form.stock < 0 || form.reorderLevel < 0) {
      toast.error("Stock and reorder level cannot be negative");
      return false;
    }
    if (form.expiry) {
      const d = Date.parse(form.expiry);
      if (isNaN(d)) {
        toast.error("Expiry date is invalid");
        return false;
      }
    }
    return true;
  };

  const handleSaveClick = useCallback(() => {
    if (!validateForm(editForm)) return;
    const globalIndex = (currentPage - 1) * itemsPerPage + editingIndex;

    // Simulate async update with loading indicator
    setLoading(true);
    setError(null);

    // Normally this would be an API call, here simulate with timeout
    setTimeout(() => {
      try {
        // Update medicines list
        const updated = [...medicines];
        updated[globalIndex] = { ...updated[globalIndex], ...editForm };
        propSetMedicines(updated);

        addAuditLog &&
          addAuditLog(
            `Edited medicine: ${editForm.name} (Batch: ${editForm.batchNumber})`,
            user
          );

        toast.success("Medicine updated successfully");
        setEditingIndex(null);
        setEditForm({});
      } catch (e) {
        setError("Failed to update medicine");
        toast.error("Failed to update medicine");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [editForm, currentPage, editingIndex, medicines, propSetMedicines, addAuditLog, user]);

  const handleDeleteClick = useCallback(
    (index) => {
      setConfirmDelete({
        isOpen: true,
        medicineIndex: (currentPage - 1) * itemsPerPage + index,
      });
    },
    [currentPage]
  );

  const confirmDeleteMedicine = useCallback(() => {
    const index = confirmDelete.medicineIndex;
    if (index === null) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const updated = medicines.filter((_, i) => i !== index);
        propSetMedicines(updated);

        addAuditLog && addAuditLog("Deleted a medicine", user);
        toast.success("Medicine deleted successfully");
        setConfirmDelete({ isOpen: false, medicineIndex: null });
        setEditingIndex(null);
        setEditForm({});
      } catch (e) {
        setError("Failed to delete medicine");
        toast.error("Failed to delete medicine");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [confirmDelete.medicineIndex, medicines, propSetMedicines, addAuditLog, user]);

  // Reset Filters button
  const resetFilters = () => {
    setSearchTerm("");
    setFilterCountry(null);
    setFilterDistrict(null);
    setFilterChiefdom(null);
    setFilterFacility(null);
    setFilterStatus(null);
  };

  // Generate unique key helper: prefer med.id if exists else fallback to batch + name + index
  const getKey = (med, idx) =>
    med.id ? med.id : `${med.name}-${med.batchNumber}-${idx}`;

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <FiltersPanel
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCountry={filterCountry}
          setFilterCountry={setFilterCountry}
          filterDistrict={filterDistrict}
          setFilterDistrict={setFilterDistrict}
          filterChiefdom={filterChiefdom}
          setFilterChiefdom={setFilterChiefdom}
          filterFacility={filterFacility}
          setFilterFacility={setFilterFacility}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          medicines={medicines}
        />
        <button
          onClick={resetFilters}
          type="button"
          className="ml-auto bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
          aria-label="Reset all filters"
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>

      {loading && (
        <div className="mb-2 text-center text-blue-600 font-semibold">
          Loading...
        </div>
      )}

      {error && (
        <div className="mb-2 text-center text-red-600 font-semibold">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="min-w-full border border-gray-300 divide-y divide-gray-200 text-sm"
          role="grid"
          aria-label="Medicine inventory table"
        >
          <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-700">
            <tr>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Name
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Batch #
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Expiry
              </th>
              <th
                className="px-2 py-2 text-right"
                scope="col"
              >
                Stock
              </th>
              <th
                className="px-2 py-2 text-right"
                scope="col"
              >
                Reorder Level
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Country
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                District
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Chiefdom
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Facility
              </th>
              <th
                className="px-2 py-2 text-center"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-2 py-2 text-left"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMedicines.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center p-4">
                  No medicines found.
                </td>
              </tr>
            ) : (
              paginatedMedicines.map((med, idx) => (
                <MedicineRow
                  key={getKey(med, idx)}
                  med={med}
                  index={idx}
                  isEditing={editingIndex === idx}
                  editForm={editForm}
                  onEditClick={handleEditClick}
                  onCancelClick={handleCancelClick}
                  onChange={handleEditChange}
                  onSaveClick={handleSaveClick}
                  onDeleteClick={handleDeleteClick}
                  user={user}
                  disabled={loading}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        disabled={loading}
      />

      <ConfirmModal
        open={confirmDelete.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this medicine?"
        onConfirm={confirmDeleteMedicine}
        onCancel={() => setConfirmDelete({ isOpen: false, medicineIndex: null })}
        disabled={loading}
      />
    </>
  );
};

export default MedicineTable;