import React, { useState, useEffect, useMemo } from "react";
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
  HiInformationCircle,
  HiOutlineExclamationCircle,
  HiCheckCircle,
} from "react-icons/hi";

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

  useEffect(() => {
    setMedicines(propMedicines);
  }, [propMedicines]);

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

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
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
      if (filterCountry && med.country !== filterCountry) return false;
      if (filterDistrict && med.district !== filterDistrict) return false;
      if (filterChiefdom && med.chiefdom !== filterChiefdom) return false;
      if (filterFacility && med.facility !== filterFacility) return false;

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

  const displayedMedicines = filteredMedicines;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedMedicines.slice(start, start + itemsPerPage);
  }, [displayedMedicines, currentPage]);

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
                    <HiOutlineExclamationCircle className="text-dhis2-red" />
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
                    <HiOutlineExclamationCircle className="text-yellow-700" />
                  </Tooltip>
                );
              if (lowStock)
                statusIcons.push(
                  <Tooltip
                    content={`Stock is low (${med.stock}), reorder level is ${med.reorderLevel}.`}
                    key="lowStock"
                  >
                    <HiOutlineExclamationCircle className="text-yellow-600" />
                  </Tooltip>
                );
              if (statusIcons.length === 0)
                statusIcons.push(
                  <Tooltip content="No issues with expiry or stock." key="ok">
                    <HiCheckCircle className="text-dhis2-green" />
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

                  <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
                    {isEditing ? (
                      <Input
                        name="country"
                        value={editForm.country}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit country"
                      />
                    ) : (
                      med.country
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
                    {isEditing ? (
                      <Input
                        name="district"
                        value={editForm.district}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit district"
                      />
                    ) : (
                      med.district
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
                    {isEditing ? (
                      <Input
                        name="chiefdom"
                        value={editForm.chiefdom}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit chiefdom"
                      />
                    ) : (
                      med.chiefdom
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[120px]">
                    {isEditing ? (
                      <Input
                        name="facility"
                        value={editForm.facility}
                        onChange={handleEditChange}
                        disabled={!hasRole(user, "admin")}
                        dense
                        aria-label="Edit facility"
                      />
                    ) : (
                      med.facility
                    )}
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[60px] text-center">
                    <div className="flex justify-center gap-1 text-lg">
                      {statusIcons}
                    </div>
                  </td>

                  <td className="px-2 py-1 whitespace-nowrap max-w-[110px]">
                    {isEditing ? (
                      <>
                        <Button
                          small
                          onClick={handleSaveClick}
                          primary
                          aria-label="Save changes"
                        >
                          Save
                        </Button>
                        <Button
                          small
                          onClick={handleCancelClick}
                          secondary
                          aria-label="Cancel editing"
                          className="ml-1"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        {hasRole(user, "admin") && (
                          <>
                            <Button
                              small
                              onClick={() => handleEditClick(idx)}
                              secondary
                              aria-label={`Edit medicine ${med.name}`}
                            >
                              Edit
                            </Button>
                            <Button
                              small
                              onClick={() => handleDeleteClick(idx)}
                              destructive
                              aria-label={`Delete medicine ${med.name}`}
                              className="ml-1"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          small
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <span className="px-2 py-1 select-none">
          Page {currentPage} of {Math.ceil(displayedMedicines.length / itemsPerPage)}
        </span>
        <Button
          small
          onClick={() =>
            setCurrentPage((p) =>
              Math.min(p + 1, Math.ceil(displayedMedicines.length / itemsPerPage))
            )
          }
          disabled={currentPage >= Math.ceil(displayedMedicines.length / itemsPerPage)}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmDelete.isOpen}
        onConfirm={handleDeleteConfirmed}
        onCancel={handleDeleteCancelled}
        title="Confirm Delete"
        message="Are you sure you want to delete this medicine?"
      />
    </div>
  );
};

export default MedicineTable;