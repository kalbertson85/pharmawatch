import React, { useState, useEffect, useMemo, useCallback } from "react";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import { hasRole } from "../utils/roleUtils";
import ConfirmModal from "./ConfirmModal";
import {
  Button,
  Input,
  SingleSelect,
  SingleSelectOption,
  Tooltip,
} from "@dhis2/ui";
import {
  IconInfo24,
  IconError24,
  IconWarning24,
  IconCheckmark24,
} from "@dhis2/ui";

const expiryThreshold = 30; // days for "expiring soon" status

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
  const itemsPerPage = 15;

  // Sync propMedicines when changed externally
  useEffect(() => {
    setMedicines(propMedicines);
  }, [propMedicines]);

  // Extract unique location lists for filters
  const countries = useMemo(() => {
    const setCountries = new Set(medicines.map((m) => m.country).filter(Boolean));
    return Array.from(setCountries).sort();
  }, [medicines]);

  const districts = useMemo(() => {
    if (!filterCountry) return [];
    const setDistricts = new Set(
      medicines
        .filter((m) => m.country === filterCountry)
        .map((m) => m.district)
        .filter(Boolean)
    );
    return Array.from(setDistricts).sort();
  }, [medicines, filterCountry]);

  const chiefdoms = useMemo(() => {
    if (!filterDistrict) return [];
    const setChiefdoms = new Set(
      medicines
        .filter((m) => m.district === filterDistrict)
        .map((m) => m.chiefdom)
        .filter(Boolean)
    );
    return Array.from(setChiefdoms).sort();
  }, [medicines, filterDistrict]);

  const facilities = useMemo(() => {
    if (!filterChiefdom) return [];
    const setFacilities = new Set(
      medicines
        .filter((m) => m.chiefdom === filterChiefdom)
        .map((m) => m.facility)
        .filter(Boolean)
    );
    return Array.from(setFacilities).sort();
  }, [medicines, filterChiefdom]);

  // Filtering logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Search filter
      const search = searchTerm.toLowerCase();
      if (
        search &&
        !(
          med.name?.toLowerCase().includes(search) ||
          med.batchNumber?.toLowerCase().includes(search) ||
          med.facility?.toLowerCase().includes(search)
        )
      ) {
        return false;
      }
      // Location filters
      if (filterCountry && med.country !== filterCountry) return false;
      if (filterDistrict && med.district !== filterDistrict) return false;
      if (filterChiefdom && med.chiefdom !== filterChiefdom) return false;
      if (filterFacility && med.facility !== filterFacility) return false;

      // Status filter
      if (filterStatus) {
        const expiryDate = med.expiry ? parseISO(med.expiry) : null;
        const daysToExpiry =
          expiryDate && isValid(expiryDate)
            ? differenceInDays(expiryDate, new Date())
            : null;
        const expired = daysToExpiry !== null && daysToExpiry < 0;
        const closeToExpiry =
          daysToExpiry !== null &&
          daysToExpiry <= expiryThreshold &&
          daysToExpiry >= 0;
        const lowStock = med.stock <= med.reorderLevel;

        switch (filterStatus) {
          case "expired":
            if (!expired) return false;
            break;
          case "expiringSoon":
            if (!closeToExpiry) return false;
            break;
          case "lowStock":
            if (!lowStock) return false;
            break;
          case "ok":
            if (expired || closeToExpiry || lowStock) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }, [
    medicines,
    searchTerm,
    filterCountry,
    filterDistrict,
    filterChiefdom,
    filterFacility,
    filterStatus,
  ]);

  // Pagination
  const displayedMedicines = filteredMedicines;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedMedicines.slice(start, start + itemsPerPage);
  }, [displayedMedicines, currentPage]);

  // Edit handlers
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
      addAuditLog && addAuditLog(user?.username, `Edited medicine ${editForm.name}`);
      return updated;
    });
    toast.success("Medicine updated successfully");
    setEditingIndex(null);
    setEditForm({});
  };

  // Delete handlers
  const handleDeleteClick = (index) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setConfirmDelete({ isOpen: true, medicineIndex: globalIndex });
  };
  const handleDeleteConfirmed = () => {
    if (confirmDelete.medicineIndex === null) return;
    setMedicines((m) => {
      const updated = [...m];
      const removedMed = updated.splice(confirmDelete.medicineIndex, 1)[0];
      propSetMedicines(updated);
      addAuditLog && addAuditLog(user?.username, `Deleted medicine ${removedMed.name}`);
      return updated;
    });
    toast.success("Medicine deleted");
    setConfirmDelete({ isOpen: false, medicineIndex: null });
  };
  const handleDeleteCancelled = () => {
    setConfirmDelete({ isOpen: false, medicineIndex: null });
  };

  // Export CSV handler (simple example)
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        [
          "Name",
          "Batch Number",
          "Expiry",
          "Stock",
          "Reorder Level",
          "Country",
          "District",
          "Chiefdom",
          "Facility",
        ].join(","),
        ...medicines.map((m) =>
          [
            m.name,
            m.batchNumber,
            m.expiry,
            m.stock,
            m.reorderLevel,
            m.country,
            m.district,
            m.chiefdom,
            m.facility,
          ].join(",")
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "medicines.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4">
      {/* Filters and Export */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <Input
          name="search"
          placeholder="Search by name, batch, or facility"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          dense
          className="min-w-[200px]"
          aria-label="Search medicines"
        />
        <SingleSelect
          selected={filterCountry}
          onChange={({ selected }) => {
            setFilterCountry(selected);
            setFilterDistrict(null);
            setFilterChiefdom(null);
            setFilterFacility(null);
          }}
          placeholder="All Countries"
          className="min-w-[150px]"
          clearable
        >
          {countries.map((c) => (
            <SingleSelectOption key={c} label={c} value={c} />
          ))}
        </SingleSelect>
        <SingleSelect
          selected={filterDistrict}
          onChange={({ selected }) => {
            setFilterDistrict(selected);
            setFilterChiefdom(null);
            setFilterFacility(null);
          }}
          placeholder="All Districts"
          className="min-w-[150px]"
          clearable
          disabled={!filterCountry}
        >
          {districts.map((d) => (
            <SingleSelectOption key={d} label={d} value={d} />
          ))}
        </SingleSelect>
        <SingleSelect
          selected={filterChiefdom}
          onChange={({ selected }) => {
            setFilterChiefdom(selected);
            setFilterFacility(null);
          }}
          placeholder="All Chiefdoms"
          className="min-w-[150px]"
          clearable
          disabled={!filterDistrict}
        >
          {chiefdoms.map((c) => (
            <SingleSelectOption key={c} label={c} value={c} />
          ))}
        </SingleSelect>
        <SingleSelect
          selected={filterFacility}
          onChange={({ selected }) => setFilterFacility(selected)}
          placeholder="All Facilities"
          className="min-w-[150px]"
          clearable
          disabled={!filterChiefdom}
        >
          {facilities.map((f) => (
            <SingleSelectOption key={f} label={f} value={f} />
          ))}
        </SingleSelect>
        <SingleSelect
          selected={filterStatus}
          onChange={({ selected }) => setFilterStatus(selected)}
          placeholder="All Status"
          className="min-w-[150px]"
          clearable
        >
          <SingleSelectOption label="Expired" value="expired" />
          <SingleSelectOption label="Expiring Soon" value="expiringSoon" />
          <SingleSelectOption label="Low Stock" value="lowStock" />
          <SingleSelectOption label="OK" value="ok" />
        </SingleSelect>

        {hasRole(user, "admin") && (
          <Button
            onClick={handleExportCSV}
            primary
            className="ml-auto"
            small
            aria-label="Export medicines to CSV"
          >
            Export CSV
          </Button>
        )}
      </div>

      {/* Medicine Table */}
      <div className="overflow-x-auto border border-dhis2-border rounded bg-white shadow-sm">
        <table className="min-w-full divide-y divide-dhis2-border text-xs sm:text-sm">
          <thead className="bg-dhis2-gray-light">
            <tr>
              {[
                "Name",
                "Batch",
                "Expiry",
                "Stock",
                "Reorder",
                "Country",
                "District",
                "Chiefdom",
                "Facility",
                "Status",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="px-2 py-1 text-left font-semibold text-dhis2-text select-none"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedMedicines.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center p-4 text-gray-500">
                  No medicines found.
                </td>
              </tr>
            )}
            {paginatedMedicines.map((med, idx) => {
              const globalIdx = (currentPage - 1) * itemsPerPage + idx;
              const isEditing = editingIndex === idx;

              // Determine status icons and tooltips
              const expiryDate = med.expiry ? parseISO(med.expiry) : null;
              const daysToExpiry =
                expiryDate && isValid(expiryDate)
                  ? differenceInDays(expiryDate, new Date())
                  : null;
              const expired = daysToExpiry !== null && daysToExpiry < 0;
              const closeToExpiry =
                daysToExpiry !== null &&
                daysToExpiry <= expiryThreshold &&
                daysToExpiry >= 0;
              const lowStock = med.stock <= med.reorderLevel;

              const statusIcons = [];
              if (expired)
                statusIcons.push(
                  <Tooltip
                    content="This medicine is past its expiry date."
                    key="expired"
                  >
                    <IconError24 className="text-dhis2-red" />
                  </Tooltip>
                );
              else if (closeToExpiry)
                statusIcons.push(
                  <Tooltip
                    content={`Will expire in ${daysToExpiry} day${
                      daysToExpiry !== 1 ? "s" : ""
                    }.`}
                    key="expiringSoon"
                  >
                    <IconWarning24 className="text-yellow-700" />
                  </Tooltip>
                );
              if (lowStock)
                statusIcons.push(
                  <Tooltip
                    content={`Stock is low (${med.stock}), reorder level is ${med.reorderLevel}.`}
                    key="lowStock"
                  >
                    <IconWarning24 className="text-yellow-600" />
                  </Tooltip>
                );
              if (statusIcons.length === 0)
                statusIcons.push(
                  <Tooltip content="No issues with expiry or stock." key="ok">
                    <IconCheckmark24 className="text-dhis2-green" />
                  </Tooltip>
                );

              return (
                <tr
                  key={globalIdx}
                  className={`${
                    expired
                      ? "bg-dhis2-red-light text-dhis2-red-dark border border-dhis2-red-dark"
                      : closeToExpiry
                      ? "bg-yellow-100 text-yellow-800"
                      : lowStock
                      ? "bg-dhis2-yellow-light text-dhis2-text border border-yellow-400"
                      : "bg-dhis2-green text-white"
                  }`}
                >
                  <td className="px-2 py-1 whitespace-nowrap max-w-[140px]">
                    {isEditing ? (
                      <Input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit medicine name"
                      />
                    ) : (
                      med.name
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
                    {isEditing ? (
                      <Input
                        name="batchNumber"
                        value={editForm.batchNumber}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit batch number"
                      />
                    ) : (
                      med.batchNumber
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {isEditing ? (
                      <Input
                        name="expiry"
                        type="date"
                        value={editForm.expiry || ""}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit expiry date"
                      />
                    ) : (
                      med.expiry
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[80px] text-right">
                    {isEditing ? (
                      <Input
                        name="stock"
                        type="number"
                        value={editForm.stock}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit stock"
                        min={0}
                      />
                    ) : (
                      med.stock
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[80px] text-right">
                    {isEditing ? (
                      <Input
                        name="reorderLevel"
                        type="number"
                        value={editForm.reorderLevel}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit reorder level"
                        min={0}
                      />
                    ) : (
                      med.reorderLevel
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {med.country}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {med.district}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {med.chiefdom}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {med.facility}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap text-xs text-dhis2-text flex gap-1 justify-center">
                    {statusIcons}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap text-right">
                    {isEditing ? (
                      hasRole(user, "admin") ? (
                        <>
                          <Button
                            small
                            primary
                            onClick={handleSaveClick}
                            className="mr-2"
                          >
                            Save
                          </Button>
                          <Button small onClick={handleCancelClick} secondary>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <span className="text-gray-500 italic">Read-only</span>
                      )
                    ) : hasRole(user, "admin") ? (
                      <>
                        <Button
                          small
                          primary
                          onClick={() => handleEditClick(idx)}
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
                          small
                          secondary
                          onClick={() => handleDeleteClick(idx)}
                          destructive
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">No edit</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-2 text-xs sm:text-sm text-dhis2-text gap-2">
        <span>
          Page {currentPage} of{" "}
          {Math.max(1, Math.ceil(displayedMedicines.length / itemsPerPage))}
        </span>
        <div className="space-x-2">
          <Button
            small
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            secondary
          >
            Prev
          </Button>
          <Button
            small
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= Math.ceil(displayedMedicines.length / itemsPerPage)}
            secondary
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Confirm Delete"
        message={
          confirmDelete.medicineIndex !== null
            ? `Delete ${medicines[confirmDelete.medicineIndex]?.name}?`
            : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancelled}
      />
    </div>
  );
};

export default MedicineTable;