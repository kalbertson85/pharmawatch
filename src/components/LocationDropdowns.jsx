import React, { useEffect, useState } from "react";
import locationData from "../data/locationData";

const LocationDropdowns = ({ filters, setFilters }) => {
  const [districts, setDistricts] = useState([]);
  const [chiefdoms, setChiefdoms] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    const country = locationData.find((c) => c.name === filters.country);
    setDistricts(country?.districts || []);
  }, [filters.country]);

  useEffect(() => {
    const district = districts.find((d) => d.name === filters.district);
    setChiefdoms(district?.chiefdoms || []);
  }, [filters.district, districts]);

  useEffect(() => {
    const chiefdom = chiefdoms.find((c) => c.name === filters.chiefdom);
    setFacilities(chiefdom?.facilities || []);
  }, [filters.chiefdom, chiefdoms]);

  const handleCountryChange = (e) => {
    setFilters({
      country: e.target.value,
      district: "",
      chiefdom: "",
      facility: "",
    });
  };

  const handleDistrictChange = (e) => {
    setFilters({
      ...filters,
      district: e.target.value,
      chiefdom: "",
      facility: "",
    });
  };

  const handleChiefdomChange = (e) => {
    setFilters({
      ...filters,
      chiefdom: e.target.value,
      facility: "",
    });
  };

  const handleFacilityChange = (e) => {
    setFilters({
      ...filters,
      facility: e.target.value,
    });
  };

  const baseSelectStyle =
    "p-1 text-xs rounded border focus:outline-none focus:ring-2 text-dhis2-text";
  const enabledStyle = "border-dhis2-grayMedium focus:ring-dhis2-blue";
  const disabledStyle = "bg-dhis2-disabled-light text-dhis2-disabled border-dhis2-disabled";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      <div className="flex flex-col text-xs">
        <label htmlFor="country" className="mb-0.5 font-medium text-dhis2-text">
          Country
        </label>
        <select
          id="country"
          className={`${baseSelectStyle} ${enabledStyle}`}
          value={filters.country}
          onChange={handleCountryChange}
        >
          <option value="">Select Country</option>
          {locationData.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-xs">
        <label htmlFor="district" className="mb-0.5 font-medium text-dhis2-text">
          District
        </label>
        <select
          id="district"
          className={`${baseSelectStyle} ${districts.length ? enabledStyle : disabledStyle}`}
          value={filters.district}
          onChange={handleDistrictChange}
          disabled={!districts.length}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-xs">
        <label htmlFor="chiefdom" className="mb-0.5 font-medium text-dhis2-text">
          Chiefdom
        </label>
        <select
          id="chiefdom"
          className={`${baseSelectStyle} ${chiefdoms.length ? enabledStyle : disabledStyle}`}
          value={filters.chiefdom}
          onChange={handleChiefdomChange}
          disabled={!chiefdoms.length}
        >
          <option value="">Select Chiefdom</option>
          {chiefdoms.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col text-xs">
        <label htmlFor="facility" className="mb-0.5 font-medium text-dhis2-text">
          Facility
        </label>
        <select
          id="facility"
          className={`${baseSelectStyle} ${facilities.length ? enabledStyle : disabledStyle}`}
          value={filters.facility}
          onChange={handleFacilityChange}
          disabled={!facilities.length}
        >
          <option value="">Select Facility</option>
          {facilities.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationDropdowns;