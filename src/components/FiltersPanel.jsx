import React from "react";

const FiltersPanel = ({
  searchTerm,
  setSearchTerm,
  filterCountry,
  setFilterCountry,
  filterDistrict,
  setFilterDistrict,
  filterChiefdom,
  setFilterChiefdom,
  filterFacility,
  setFilterFacility,
  filterStatus,
  setFilterStatus,
  medicines,
}) => {
  // Helper to get unique sorted values for a field
  const uniqueSortedValues = (field) => {
    const vals = medicines
      .map((m) => m[field])
      .filter((v) => v != null && v !== "")
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort();
    return vals;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="search"
        placeholder="Search medicines..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm flex-grow min-w-[200px]"
        aria-label="Search medicines"
      />

      <select
        value={filterCountry || ""}
        onChange={(e) =>
          setFilterCountry(e.target.value || null)
        }
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Filter by Country"
      >
        <option value="">All Countries</option>
        {uniqueSortedValues("country").map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filterDistrict || ""}
        onChange={(e) =>
          setFilterDistrict(e.target.value || null)
        }
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Filter by District"
      >
        <option value="">All Districts</option>
        {uniqueSortedValues("district").map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filterChiefdom || ""}
        onChange={(e) =>
          setFilterChiefdom(e.target.value || null)
        }
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Filter by Chiefdom"
      >
        <option value="">All Chiefdoms</option>
        {uniqueSortedValues("chiefdom").map((ch) => (
          <option key={ch} value={ch}>
            {ch}
          </option>
        ))}
      </select>

      <select
        value={filterFacility || ""}
        onChange={(e) =>
          setFilterFacility(e.target.value || null)
        }
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Filter by Facility"
      >
        <option value="">All Facilities</option>
        {uniqueSortedValues("facility").map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={filterStatus || ""}
        onChange={(e) =>
          setFilterStatus(e.target.value || null)
        }
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Filter by Status"
      >
        <option value="">All Statuses</option>
        {uniqueSortedValues("status").map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltersPanel;