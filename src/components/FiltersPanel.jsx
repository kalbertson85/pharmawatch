import React, { useMemo } from "react";
import { Input, SingleSelect, SingleSelectOption } from "@dhis2/ui";

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
  // Generate cascading dropdown options
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

  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      <Input
        name="search"
        placeholder="Search by name, batch, or facility"
        value={searchTerm}
        onChange={({ value }) => setSearchTerm(value)}
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
    </div>
  );
};

export default FiltersPanel;