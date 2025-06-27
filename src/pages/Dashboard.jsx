import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import { MdWarning, MdErrorOutline, MdInfoOutline } from "react-icons/md";
import MedicineTable from "../components/MedicineTable";
import PieChartSection from "../components/PieChartSection";
import BarChartSection from "../components/BarChartSection";
import LocationDropdowns from "../components/LocationDropdowns";
import MedicineForm from "../components/MedicineForm";
import MedicineAnalytics from "../components/MedicineAnalytics";
import LineGraphSection from "../components/LineGraphSection";
import HeatMapSection from "../components/HeatMapSection";
import MapVisualization from "../components/MapVisualization";
import BatchUploadCSV from "../components/BatchUploadCSV";
import { toast } from "sonner";
import { syncToDHIS2 } from "../services/api";

const Dashboard = ({ medicines, setMedicines, addAuditLog, user }) => {
  const [filters, setFilters] = useState({
    country: "",
    district: "",
    chiefdom: "",
    facility: "",
  });

  const [chartFilters, setChartFilters] = useState({ expired: true, valid: true });
  const [expiryRange, setExpiryRange] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const modalRef = useRef(null);
  const [hasNotified, setHasNotified] = useState(false);

  const now = new Date();

  // Smart Notification Lists
  const expiredMedicinesList = useMemo(() =>
    medicines.filter(m => new Date(m.expiry) < now), [medicines, now]);

  const expiringSoonMedicinesList = useMemo(() =>
    medicines.filter(m => {
      const expiryDate = new Date(m.expiry);
      const diffDays = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }), [medicines, now]);

  const lowStockMedicinesList = useMemo(() =>
    medicines.filter(m => m.stock <= m.reorderLevel), [medicines]);

  // Show toast alerts once on page load
  useEffect(() => {
    if (!hasNotified) {
      if (expiredMedicinesList.length > 0) {
        toast.error(`${expiredMedicinesList.length} medicine${expiredMedicinesList.length > 1 ? "s" : ""} have expired.`);
      }
      if (expiringSoonMedicinesList.length > 0) {
        toast.warning(`${expiringSoonMedicinesList.length} medicine${expiringSoonMedicinesList.length > 1 ? "s" : ""} expiring within 7 days.`);
      }
      if (lowStockMedicinesList.length > 0) {
        toast.info(`${lowStockMedicinesList.length} medicine${lowStockMedicinesList.length > 1 ? "s" : ""} below reorder level.`);
      }
      setHasNotified(true);
    }
  }, [expiredMedicinesList, expiringSoonMedicinesList, lowStockMedicinesList, hasNotified]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      if (filters.country && med.country !== filters.country) return false;
      if (filters.district && med.district !== filters.district) return false;
      if (filters.chiefdom && med.chiefdom !== filters.chiefdom) return false;
      if (filters.facility && med.facility !== filters.facility) return false;
      return true;
    });
  }, [medicines, filters]);

  const chartFilteredMedicines = useMemo(() => {
    const rangeLimit = {
      "7": 7,
      "30": 30,
      "90": 90,
    }[expiryRange];

    return filteredMedicines.filter((m) => {
      const expiryDate = new Date(m.expiry);
      const isExpired = expiryDate < now;
      const isInRange = !rangeLimit || (expiryDate - now <= rangeLimit * 86400000);
      return ((isExpired && chartFilters.expired) || (!isExpired && chartFilters.valid)) && isInRange;
    });
  }, [filteredMedicines, chartFilters, expiryRange, now]);

  useEffect(() => {
    if (!editingMedicine) return;

    const focusableElementsString =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';

    const modalNode = modalRef.current;
    const focusableElements = modalNode.querySelectorAll(focusableElementsString);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const trapFocus = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      } else if (e.key === "Escape") {
        setEditingMedicine(null);
      }
    };

    document.addEventListener("keydown", trapFocus);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", trapFocus);
    };
  }, [editingMedicine]);

  const handleBatchUpload = (uploadedMedicines) => {
    if (!uploadedMedicines || uploadedMedicines.length === 0) {
      toast.error("No valid medicines found in the uploaded file.");
      return;
    }

    const existingBatchNumbers = new Set(medicines.map((m) => m.batchNumber));
    const newMedicines = uploadedMedicines.filter((m) => !existingBatchNumbers.has(m.batchNumber));

    if (newMedicines.length === 0) {
      toast.warning("All uploaded medicines already exist in the system.");
      return;
    }

    setMedicines((prev) => [...prev, ...newMedicines]);

    newMedicines.forEach((med) => {
      addAuditLog({
        action: "batch_upload",
        medicine: med.name,
        timestamp: new Date().toISOString(),
        user: user?.name || "Unknown",
      });
    });

    toast.success(`Successfully uploaded ${newMedicines.length} medicines.`);
  };

  const handleSyncWithDHIS2 = useCallback(async () => {
    try {
      toast("Starting DHIS2 data sync...");

      const payload = {
        dataSet: "YOUR_DATASET_ID",
        completeDate: new Date().toISOString().split("T")[0],
        period: "202506",
        orgUnit: "YOUR_ORG_UNIT_ID",
        dataValues: filteredMedicines.map((med) => ({
          dataElement: "YOUR_DATA_ELEMENT_ID",
          categoryOptionCombo: "CATEGORY_OPTION_COMBO_ID",
          value: med.stock,
        })),
      };

      const response = await syncToDHIS2(payload);
      console.log("DHIS2 Sync response:", response);
      toast.success(`Successfully synced ${filteredMedicines.length} medicines with DHIS2.`);
    } catch (error) {
      toast.error("DHIS2 sync failed. Please check logs or credentials.");
      console.error("Sync error:", error);
    }
  }, [filteredMedicines]);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chartFilteredMedicines, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "filtered_medicines.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalMedicines = filteredMedicines.length;
  const expiredMedicines = expiredMedicinesList.length;
  const lowStockMedicines = lowStockMedicinesList.length;

  const topStocked = [...filteredMedicines].sort((a, b) => b.stock - a.stock).slice(0, 5);
  const closestToExpiry = [...filteredMedicines].sort((a, b) => new Date(a.expiry) - new Date(b.expiry)).slice(0, 5);
  const belowReorder = filteredMedicines.filter((m) => m.stock <= m.reorderLevel);

  const facilitySummary = useMemo(() => {
    const map = {};
    filteredMedicines.forEach((m) => {
      if (!map[m.facility]) map[m.facility] = 0;
      map[m.facility] += m.stock;
    });
    return Object.entries(map).map(([facility, stock]) => ({ facility, stock }));
  }, [filteredMedicines]);

  const handleMedicineSave = (updatedMedicine) => {
    setMedicines((prev) =>
      prev.map((med) => (med.batchNumber === updatedMedicine.batchNumber ? updatedMedicine : med))
    );
    addAuditLog({
      action: editingMedicine ? "update" : "add",
      medicine: updatedMedicine.name,
      timestamp: new Date().toISOString(),
      user: user?.name || "Unknown",
    });
    setEditingMedicine(null);
    toast.success(`Medicine ${updatedMedicine.name} saved successfully.`);
  };

  return (
    <main className="flex-grow px-3 sm:px-4 py-4 max-w-full min-h-screen bg-dhis2-grayLight dark:bg-dhis2-dark-background text-dhis2-text dark:text-dhis2-dark-textPrimary text-sm">
      
      {/* Smart Notifications Banner */}
      {(expiredMedicinesList.length > 0 || expiringSoonMedicinesList.length > 0 || lowStockMedicinesList.length > 0) && (
        <section className="mb-4 max-w-5xl mx-auto space-y-2">
          {expiredMedicinesList.length > 0 && (
            <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded p-3 text-red-900 dark:text-red-300 font-semibold text-sm shadow">
              <MdErrorOutline size={20} />
              <span>
                <strong>{expiredMedicinesList.length}</strong> medicine{expiredMedicinesList.length > 1 ? "s" : ""} have <u>expired</u>.
              </span>
            </div>
          )}
          {expiringSoonMedicinesList.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900 border border-orange-400 dark:border-orange-600 rounded p-3 text-orange-900 dark:text-orange-300 font-semibold text-sm shadow">
              <MdWarning size={20} />
              <span>
                <strong>{expiringSoonMedicinesList.length}</strong> medicine{expiringSoonMedicinesList.length > 1 ? "s" : ""} are <u>expiring within 7 days</u>.
              </span>
            </div>
          )}
          {lowStockMedicinesList.length > 0 && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded p-3 text-yellow-900 dark:text-yellow-300 font-semibold text-sm shadow">
              <MdInfoOutline size={20} />
              <span>
                <strong>{lowStockMedicinesList.length}</strong> medicine{lowStockMedicinesList.length > 1 ? "s" : ""} are <u>below reorder level</u>.
              </span>
            </div>
          )}
        </section>
      )}

      <header className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">PharmaWatch Dashboard</h1>
          <p className="mt-0.5 text-xs text-dhis2-grayDark dark:text-dhis2-dark-textSecondary">
            Monitor and manage expiry dates and stock levels across locations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-white dark:bg-dhis2-dark-surface border border-dhis2-grayLight dark:border-dhis2-dark-border rounded px-2 py-1 shadow-sm">
            User: {user?.name || "Unknown"}
          </span>
          <button onClick={handleExportJSON} className="bg-dhis2-blue text-white px-2 py-1 rounded text-xs hover:bg-dhis2-blueDark">
            Export JSON
          </button>
          <button onClick={handlePrint} className="bg-dhis2-grayMedium text-white px-2 py-1 rounded text-xs hover:bg-dhis2-grayDark">
            Print
          </button>
          <button
            onClick={handleSyncWithDHIS2}
            className="bg-dhis2-green hover:bg-dhis2-green-dark text-white font-medium py-1.5 px-3 text-sm rounded shadow-sm transition focus:outline-none focus:ring-2 focus:ring-dhis2-green focus:ring-offset-1"
          >
            Sync with DHIS2
          </button>
        </div>
      </header>

      {/* Batch Upload CSV component */}
      <section className="mb-5 max-w-2xl mx-auto">
        <BatchUploadCSV onUpload={handleBatchUpload} />
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-semibold mb-1">Filter by Location</h2>
        <LocationDropdowns filters={filters} setFilters={setFilters} />
      </section>

      <section className="mb-5">
        <h2 className="text-sm font-semibold mb-1">Filter by Expiry Range</h2>
        <select
          className="text-sm px-2 py-1 border border-dhis2-border rounded bg-white dark:bg-dhis2-dark-surface"
          value={expiryRange}
          onChange={(e) => setExpiryRange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="7">Expiring in next 7 days</option>
          <option value="30">Expiring in next 30 days</option>
          <option value="90">Expiring in next 90 days</option>
        </select>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
        {[{
          title: "Total Medicines",
          value: totalMedicines,
          color: "text-dhis2-blue"
        }, {
          title: "Expired Medicines",
          value: expiredMedicines,
          color: "text-dhis2-red"
        }, {
          title: "Low Stock Medicines",
          value: lowStockMedicines,
          color: "text-dhis2-yellow"
        }].map(({ title, value, color }) => (
          <div key={title} className="bg-white dark:bg-dhis2-dark-surface rounded-lg shadow-sm border border-dhis2-grayLight dark:border-dhis2-dark-border p-3 text-center">
            <h3 className="text-xs font-medium mb-0.5">{title}</h3>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-7xl mx-auto px-2 sm:px-0">
        <PieChartSection medicines={filteredMedicines} chartFilters={chartFilters} setChartFilters={setChartFilters} />
        <BarChartSection medicines={chartFilteredMedicines} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-7xl mx-auto px-2 sm:px-0">
        <LineGraphSection medicines={filteredMedicines} />
        <HeatMapSection medicines={filteredMedicines} />
        <MapVisualization medicines={filteredMedicines} />
      </section>

      <section className="mt-6 max-w-7xl mx-auto px-2 sm:px-0">
        <h2 className="text-sm font-semibold mb-2">Medicines Overview</h2>
        <div className="bg-white dark:bg-dhis2-dark-surface rounded-lg shadow-sm border border-dhis2-grayLight dark:border-dhis2-dark-border p-3">
          <MedicineTable
            medicines={chartFilteredMedicines}
            onEditMedicine={setEditingMedicine}
            user={user}
          />
        </div>
        <button
          onClick={() => setShowAnalytics((prev) => !prev)}
          className="mt-4 bg-dhis2-blue text-white px-3 py-1 rounded text-sm hover:bg-dhis2-blueDark"
        >
          {showAnalytics ? "Hide" : "Show"} Detailed Analytics
        </button>
        {showAnalytics && (
          <div className="mt-4 bg-white dark:bg-dhis2-dark-surface rounded-lg p-4 border border-dhis2-grayLight dark:border-dhis2-dark-border">
            <h3 className="text-md font-semibold mb-2">Detailed Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Top 5 Most Stocked</h4>
                <ul className="text-xs list-disc list-inside">
                  {topStocked.map((m) => (
                    <li key={m.batchNumber}>{m.name} — {m.stock} units</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">5 Closest to Expiry</h4>
                <ul className="text-xs list-disc list-inside">
                  {closestToExpiry.map((m) => (
                    <li key={m.batchNumber}>{m.name} — {m.expiry}</li>
                  ))}
                </ul>
              </div>
              <div className="col-span-full">
                <h4 className="text-sm font-medium mb-1">Below Reorder Level</h4>
                <ul className="text-xs list-disc list-inside">
                  {belowReorder.length > 0 ? (
                    belowReorder.map((m) => (
                      <li key={m.batchNumber}>{m.name} — {m.stock} (reorder: {m.reorderLevel})</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>
              <div className="col-span-full">
                <h4 className="text-sm font-medium mb-1">Facility-wise Stock Summary</h4>
                <ul className="text-xs list-disc list-inside">
                  {facilitySummary.map(({ facility, stock }) => (
                    <li key={facility}>{facility}: {stock} units</li>
                  ))}
                </ul>
              </div>
              <div className="col-span-full">
                <MedicineAnalytics medicines={filteredMedicines} />
              </div>
              <div className="col-span-full">
                <LineGraphSection medicines={filteredMedicines} />
              </div>
              <div className="col-span-full">
                <HeatMapSection medicines={filteredMedicines} />
              </div>
              <div className="col-span-full">
                <MapVisualization medicines={filteredMedicines} />
              </div>
            </div>
          </div>
        )}
      </section>

      <CSSTransition
        in={!!editingMedicine}
        timeout={300}
        classNames="modal-fade"
        unmountOnExit
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
          onClick={() => setEditingMedicine(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-dhis2-dark-surface rounded-lg p-6 max-w-lg w-full shadow-lg transform transition-transform"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>
            <MedicineForm
              editingMedicine={editingMedicine}
              setMedicines={setMedicines}
              addAuditLog={addAuditLog}
              user={user}
              clearEditingMedicine={() => setEditingMedicine(null)}
            />
            <button
              className="mt-4 bg-dhis2-grayMedium text-white px-4 py-2 rounded hover:bg-dhis2-grayDark focus:outline-none focus:ring-2 focus:ring-dhis2-grayDark"
              onClick={() => setEditingMedicine(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      </CSSTransition>

      <style jsx>{`
        .modal-fade-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        .modal-fade-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 300ms, transform 300ms;
        }
        .modal-fade-exit {
          opacity: 1;
          transform: scale(1);
        }
        .modal-fade-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 300ms, transform 300ms;
        }
      `}</style>
    </main>
  );
};

export default Dashboard;