import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MedicineForm from "./components/MedicineForm";
import MedicineTable from "./components/MedicineTable";
import AuditLog from "./pages/AuditLog";
import MedicinePage from "./components/MedicinePage";

// Validate audit log structure
const isValidLog = (log) =>
  log &&
  typeof log === "object" &&
  !Array.isArray(log) &&
  log.timestamp &&
  !isNaN(Date.parse(log.timestamp)) &&
  log.user &&
  log.action &&
  log.medicineName;

const ProtectedRoute = ({ user, children }) => {
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [user, setUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const getMedicinesKey = (username) => `medicines_${username}`;
  const getAuditLogsKey = (username) => `auditLogs_${username}`;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userInfoRaw = localStorage.getItem("user");

    let userInfo = null;
    try {
      userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
    } catch {
      userInfo = null;
    }

    setIsLoggedIn(!!token && !!userInfo);
    setUser(userInfo);

    if (userInfo?.username) {
      const savedMedsRaw = localStorage.getItem(getMedicinesKey(userInfo.username));
      const savedMeds = savedMedsRaw ? JSON.parse(savedMedsRaw) : [];
      setMedicines(Array.isArray(savedMeds) ? savedMeds : []);

      const savedLogsRaw = localStorage.getItem(getAuditLogsKey(userInfo.username));
      const parsedLogs = savedLogsRaw ? JSON.parse(savedLogsRaw) : [];
      const validLogs = Array.isArray(parsedLogs) ? parsedLogs.filter(isValidLog) : [];
      setAuditLogs(validLogs);
    } else {
      setMedicines([]);
      setAuditLogs([]);
    }
  }, []);

  useEffect(() => {
    if (user?.username) {
      localStorage.setItem(getMedicinesKey(user.username), JSON.stringify(medicines));
    }
  }, [medicines, user]);

  useEffect(() => {
    if (user?.username) {
      const validLogs = auditLogs.filter(isValidLog);
      localStorage.setItem(getAuditLogsKey(user.username), JSON.stringify(validLogs));
    }
  }, [auditLogs, user]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setMedicines([]);
    setAuditLogs([]);
  };

  const addAuditLog = (entry) => {
    if (isValidLog(entry)) {
      setAuditLogs((prevLogs) => [...prevLogs, entry]);
    }
  };

  // 🔔 Smart Notification Counts
  const now = new Date();

  const expiredCount = medicines.filter((m) => new Date(m.expiry) < now).length;

  const expiringSoonCount = medicines.filter((m) => {
    const expiryDate = new Date(m.expiry);
    const diffDays = (expiryDate - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const lowStockCount = medicines.filter((m) => m.stock <= m.reorderLevel).length;

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Layout
        user={user}
        onLogout={handleLogout}
        expiredCount={expiredCount}
        expiringSoonCount={expiringSoonCount}
        lowStockCount={lowStockCount}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <Dashboard
                medicines={medicines}
                setMedicines={setMedicines}
                addAuditLog={addAuditLog}
                user={user}
              />
            }
          />

          <Route
            path="/add"
            element={
              <ProtectedRoute user={user}>
                <MedicineForm
                  medicines={medicines}
                  setMedicines={setMedicines}
                  addAuditLog={addAuditLog}
                  user={user}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/list"
            element={
              <MedicineTable
                medicines={medicines}
                setMedicines={setMedicines}
                addAuditLog={addAuditLog}
                user={user}
              />
            }
          />

          <Route
            path="/medicines"
            element={
              <ProtectedRoute user={user}>
                <MedicinePage
                  medicines={medicines}
                  setMedicines={setMedicines}
                  addAuditLog={addAuditLog}
                  user={user}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-log"
            element={
              <ProtectedRoute user={user}>
                <AuditLog logs={auditLogs} user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;