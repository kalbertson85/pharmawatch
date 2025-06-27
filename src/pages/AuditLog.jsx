import React, { useState } from "react";
import { CSVLink } from "react-csv";

const isValidDate = (date) => {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
};

const AuditLog = ({ logs = [] }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const csvHeaders = [
    { label: "Timestamp", key: "timestamp" },
    { label: "User", key: "user" },
    { label: "Action", key: "action" },
    { label: "Medicine", key: "medicineName" },
    { label: "Details", key: "details" },
  ];

  const start = startDate ? new Date(startDate).getTime() : null;
  const end = endDate ? new Date(endDate).getTime() + 86400000 - 1 : null;

  // Filter logs for valid entries and date range
  const filteredLogs = (logs || [])
    .filter(
      (log) =>
        log &&
        isValidDate(log.timestamp) &&
        log.user &&
        log.action &&
        log.medicineName
    )
    .filter((log) => {
      const time = new Date(log.timestamp).getTime();
      return (!start || time >= start) && (!end || time <= end);
    });

  const csvData = filteredLogs.map((log) => ({
    timestamp: new Date(log.timestamp).toLocaleString(),
    user: log.user,
    action: log.action,
    medicineName: log.medicineName,
    details: log.details ? JSON.stringify(log.details) : "-",
  }));

  const toggleExpand = (index) =>
    setExpandedIndex((prev) => (prev === index ? null : index));

  return (
    <main
      className="flex-grow p-3 sm:p-4 max-w-full overflow-x-auto min-h-screen bg-dhis2-grayLight dark:bg-dhis2-dark-background text-dhis2-text dark:text-dhis2-dark-textPrimary transition-colors text-sm"
      role="main"
      aria-label="Audit Log Page"
    >
      <header className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="mt-1 text-xs text-dhis2-grayDark dark:text-dhis2-dark-textSecondary">
            View all system changes made to medicines.
          </p>
        </div>
        {filteredLogs.length > 0 && (
          <CSVLink
            headers={csvHeaders}
            data={csvData}
            filename="pharmawatch_audit_log.csv"
            className="bg-dhis2-blue text-white px-3 py-1.5 rounded text-xs sm:text-sm font-medium shadow-sm hover:bg-dhis2-blue-dark transition"
            aria-label="Export audit logs to CSV"
          >
            Export to CSV
          </CSVLink>
        )}
      </header>

      <section className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <label htmlFor="startDate" className="text-xs font-medium">
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-dhis2-grayMedium rounded px-2 py-1 text-xs dark:bg-dhis2-dark-surface"
          />
        </div>
        <div className="flex items-center gap-1">
          <label htmlFor="endDate" className="text-xs font-medium">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-dhis2-grayMedium rounded px-2 py-1 text-xs dark:bg-dhis2-dark-surface"
          />
        </div>
      </section>

      <section className="bg-white dark:bg-dhis2-dark-surface rounded-lg shadow border border-dhis2-grayLight dark:border-dhis2-dark-border p-4">
        {filteredLogs.length === 0 ? (
          <p className="text-dhis2-grayDark dark:text-dhis2-dark-textSecondary text-sm">
            No audit logs found for selected date range.
          </p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] rounded-md">
            <table className="w-full text-left border border-dhis2-grayMedium text-xs sm:text-sm">
              <thead className="bg-dhis2-grayLight dark:bg-dhis2-dark-subtle sticky top-0 z-10 text-xs sm:text-sm">
                <tr>
                  <th className="border border-dhis2-grayMedium p-2 w-6">Timestamp</th>
                  <th className="border border-dhis2-grayMedium p-2 w-20">User</th>
                  <th className="border border-dhis2-grayMedium p-2 w-6">Action</th>
                  <th className="border border-dhis2-grayMedium p-2 w-32">Medicine</th>
                  <th className="border border-dhis2-grayMedium p-2 w-20">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <React.Fragment key={i}>
                    <tr className="border-t border-dhis2-grayMedium hover:bg-dhis2-grayLight dark:hover:bg-dhis2-dark-subtle transition">
                      <td className="border border-dhis2-grayMedium p-1 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="border border-dhis2-grayMedium p-1 whitespace-nowrap">
                        {log.user}
                      </td>
                      <td className="border border-dhis2-grayMedium p-1 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="border border-dhis2-grayMedium p-1 whitespace-nowrap">
                        {log.medicineName}
                      </td>
                      <td className="border border-dhis2-grayMedium p-1">
                        <button
                          onClick={() => toggleExpand(i)}
                          className="text-dhis2-blue hover:underline text-xs"
                        >
                          {expandedIndex === i ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expandedIndex === i && (
                      <tr className="bg-dhis2-grayLight dark:bg-dhis2-dark-subtle">
                        <td colSpan={5} className="p-2 border border-dhis2-grayMedium">
                          <pre className="text-[10px] sm:text-xs whitespace-pre-wrap break-words max-h-64 overflow-auto bg-white dark:bg-dhis2-dark-surface rounded-md p-2">
                            {log.details
                              ? JSON.stringify(log.details, null, 2)
                              : "No additional details"}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AuditLog;