import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const ALERT_STORAGE_KEY = "pharmawatch_alerts";
const DISMISSED_ALERTS_KEY = "pharmawatch_dismissed_alerts";

const AlertScheduler = ({ medicines, user, expiringSoonDays = 7 }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_ALERTS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Track alerts that have been shown this session to avoid repeats
  const [shownAlertIds, setShownAlertIds] = useState(new Set());

  // Generate alerts based on medicines, debounced for efficiency
  const generateAlerts = useCallback(() => {
    const now = new Date();
    const newAlerts = [];

    medicines.forEach((med) => {
      if (!med.expiry) return; // skip if no expiry date

      const expiryDate = new Date(med.expiry);
      const isExpired = expiryDate < now;
      const isExpiringSoon = expiryDate - now < expiringSoonDays * 24 * 60 * 60 * 1000 && expiryDate >= now;
      const isLowStock = med.stock <= med.reorderLevel;

      const alertPrefix = `${med.name} [${med.facility}]`;

      if (isExpired) {
        newAlerts.push({
          id: `${med.batchNumber}-expired`,
          type: "danger",
          message: `${alertPrefix} has expired on ${med.expiry}`,
        });
      } else if (isExpiringSoon) {
        newAlerts.push({
          id: `${med.batchNumber}-expiring`,
          type: "warning",
          message: `${alertPrefix} will expire soon (${med.expiry})`,
        });
      }

      if (isLowStock) {
        newAlerts.push({
          id: `${med.batchNumber}-lowstock`,
          type: "info",
          message: `${alertPrefix} is low on stock (${med.stock} ≤ ${med.reorderLevel})`,
        });
      }
    });

    // Filter out dismissed alerts
    const filteredAlerts = newAlerts.filter(alert => !dismissedIds.has(alert.id));
    setAlerts(filteredAlerts);
  }, [medicines, expiringSoonDays, dismissedIds]);

  // Debounce generateAlerts to reduce frequent updates
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      generateAlerts();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [medicines, generateAlerts]);

  // Show toasts for new alerts not already shown this session
  useEffect(() => {
    alerts.forEach((alert, i) => {
      if (!shownAlertIds.has(alert.id)) {
        toast(alert.message, {
          id: alert.id,
          className: {
            danger: "bg-red-100 text-red-800 border-red-400",
            warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
            info: "bg-blue-100 text-blue-800 border-blue-400",
          }[alert.type],
          duration: 10000 + i * 500,
          dismissible: true,
          ariaLive: "assertive",
          onDismiss: () => handleDismiss(alert.id),
        });
        setShownAlertIds((prev) => new Set(prev).add(alert.id));
      }
    });
  }, [alerts, shownAlertIds]);

  // Dismiss alert handler
  const handleDismiss = (id) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Restore a dismissed alert
  const handleRestore = (id) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
    generateAlerts();
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-0 right-0 m-4 max-w-sm space-y-2 z-50 pointer-events-none"
    >
      {/* Active Alerts Panel */}
      {alerts.length > 0 && (
        <div className="bg-white border border-gray-300 rounded shadow p-4 pointer-events-auto">
          <h3 className="font-semibold mb-2">Active Alerts</h3>
          <ul className="list-disc list-inside max-h-48 overflow-y-auto text-sm">
            {alerts.map(({ id, message, type }) => (
              <li
                key={id}
                className={`mb-1 ${
                  {
                    danger: "text-red-700",
                    warning: "text-yellow-700",
                    info: "text-blue-700",
                  }[type]
                }`}
              >
                {message}{" "}
                <button
                  aria-label={`Dismiss alert: ${message}`}
                  onClick={() => handleDismiss(id)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dismissed Alerts Panel */}
      {dismissedIds.size > 0 && (
        <div className="bg-white border border-gray-300 rounded shadow p-4 mt-2 pointer-events-auto max-w-sm">
          <h3 className="font-semibold mb-2">Dismissed Alerts</h3>
          <ul className="list-disc list-inside max-h-32 overflow-y-auto text-sm">
            {Array.from(dismissedIds).map((id) => (
              <li key={id} className="mb-1 text-gray-500">
                {id}{" "}
                <button
                  aria-label={`Restore alert ${id}`}
                  onClick={() => handleRestore(id)}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AlertScheduler;