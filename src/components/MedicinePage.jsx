import React, { useState, useEffect } from "react";
import MedicineForm from "./MedicineForm";
import MedicineTable from "./MedicineTable";

const MEDICINES_STORAGE_KEY = "medicines";

const MedicinePage = ({ medicines: propMedicines, setMedicines: propSetMedicines, user, addAuditLog }) => {
  // Manage medicines state internally if no props passed (hybrid support)
  const [medicines, setMedicines] = useState(() => {
    if (propMedicines && propSetMedicines) {
      return propMedicines;
    } else {
      const saved = localStorage.getItem(MEDICINES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  });

  // Sync with prop medicines if props change
  useEffect(() => {
    if (propMedicines) {
      setMedicines(propMedicines);
    }
  }, [propMedicines]);

  // Persist medicines to localStorage if using local fallback
  useEffect(() => {
    if (!propMedicines && medicines) {
      localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(medicines));
    }
  }, [medicines, propMedicines]);

  // Determine setters to pass down
  const medicinesToPass = propMedicines && propSetMedicines ? propMedicines : medicines;
  const setMedicinesToPass = propSetMedicines || setMedicines;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-dhis2-blue">
        Medicine Management
      </h1>
      <MedicineForm
        medicines={medicinesToPass}
        setMedicines={setMedicinesToPass}
        addAuditLog={addAuditLog}
        user={user}
      />
      <MedicineTable
        medicines={medicinesToPass}
        setMedicines={setMedicinesToPass}
        addAuditLog={addAuditLog}
        user={user}
      />
    </div>
  );
};

export default MedicinePage;