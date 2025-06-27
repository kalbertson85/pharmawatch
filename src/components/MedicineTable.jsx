import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";
import FiltersPanel from "./FiltersPanel";
import MedicineRow from "./MedicineRow";
import Pagination from "./Pagination";
import useFilteredMedicines from "../hooks/useFilteredMedicines";
import { hasRole } from "../utils/roleUtils";

const itemsPerPage = 15;

const MedicineTable = ({
  medicines: propMedicines,
  setMedicines: propSetMedicines,
  addAuditLog,
  user,
}) => {
  const [medicines, setMedicines] = useState(propMedicines);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterChiefdom, setFilterChiefdom] = useState(null);
  const [filterFacility, setFilterFacility] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    medicineIndex: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMedicines(propMedicines);
  }, [propMedicines]);

  const filteredMedicines = useFilteredMedicines({
    medicines,
    searchTerm,
    filterCountry,
    filterDistrict,
    filterChiefdom,
    filterFacility,
    filterStatus,
  });

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  // Reset currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditForm({ ...paginatedMedicines[index] });
  };

  const handleCancelClick = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleSaveClick = () => {
    const globalIndex = (currentPage - 1) * itemsPerPage + editingIndex;
    setMedicines((m) => {
      const updated = [...m];
      updated[globalIndex] = { ...updated[globalIndex], ...editForm };
      propSetMedicines(updated);
      return updated;
    });
    addAuditLog(
      `Edited medicine: ${editForm.name} (Batch: ${editForm.batchNumber})`,
      user
    );
    toast.success("Medicine updated successfully");
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDeleteClick = (index) => {
    setConfirmDelete({
      isOpen: true,
      medicineIndex: (currentPage - 1) * itemsPerPage + index,
    });
  };

  const confirmDeleteMedicine = () => {
    const index = confirmDelete.medicineIndex;
    setMedicines((m) => {
      const updated = m.filter((_, i) => i !== index);
      propSetMedicines(updated);
      return updated;
    });
    addAuditLog("Deleted a medicine", user);
    toast.success("Medicine deleted successfully");
    setConfirmDelete({ isOpen: false, medicineIndex: null });
  };

  return (
    <>
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

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Batch #</th>
              <th className="px-2 py-2 text-left">Expiry</th>
              <th className="px-2 py-2 text-right">Stock</th>
              <th className="px-2 py-2 text-right">Reorder Level</th>
              <th className="px-2 py-2 text-left">Country</th>
              <th className="px-2 py-2 text-left">District</th>
              <th className="px-2 py-2 text-left">Chiefdom</th>
              <th className="px-2 py-2 text-left">Facility</th>
              <th className="px-2 py-2 text-center">Status</th>
              <th className="px-2 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMedicines.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center p-4">
                  No medicines found.
                </td>
              </tr>
            )}
            {paginatedMedicines.map((med, idx) => (
              <MedicineRow
                key={`${med.name}-${med.batchNumber}-${idx}`}
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
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        open={confirmDelete.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this medicine?"
        onConfirm={confirmDeleteMedicine}
        onCancel={() => setConfirmDelete({ isOpen: false, medicineIndex: null })}
      />
    </>
  );
};

export default MedicineTable;