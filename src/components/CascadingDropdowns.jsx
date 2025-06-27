import React, { useState } from "react";
import { locationData } from "./locationData";

function CascadingDropdowns() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedChiefdom, setSelectedChiefdom] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");

  // Get provinces based on selected country
  const provinces =
    selectedCountry &&
    locationData.find((c) => c.country === selectedCountry)?.provinces;

  // Get districts based on selected province
  const districts =
    selectedProvince &&
    provinces?.find((p) => p.name === selectedProvince)?.districts;

  // Get chiefdoms based on selected district
  const chiefdoms =
    selectedDistrict &&
    districts?.find((d) => d.name === selectedDistrict)?.chiefdoms;

  // Get facilities based on selected chiefdom
  const facilities =
    selectedChiefdom &&
    chiefdoms?.find((ch) => ch.name === selectedChiefdom)?.facilities;

  return (
    <div>
      {/* Country dropdown */}
      <select
        value={selectedCountry}
        onChange={(e) => {
          setSelectedCountry(e.target.value);
          setSelectedProvince("");
          setSelectedDistrict("");
          setSelectedChiefdom("");
          setSelectedFacility("");
        }}
      >
        <option value="">Select Country</option>
        {locationData.map((c) => (
          <option key={c.country} value={c.country}>
            {c.country}
          </option>
        ))}
      </select>

      {/* Province dropdown */}
      <select
        value={selectedProvince}
        onChange={(e) => {
          setSelectedProvince(e.target.value);
          setSelectedDistrict("");
          setSelectedChiefdom("");
          setSelectedFacility("");
        }}
        disabled={!provinces}
      >
        <option value="">Select Province</option>
        {provinces?.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {/* District dropdown */}
      <select
        value={selectedDistrict}
        onChange={(e) => {
          setSelectedDistrict(e.target.value);
          setSelectedChiefdom("");
          setSelectedFacility("");
        }}
        disabled={!districts}
      >
        <option value="">Select District</option>
        {districts?.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Chiefdom dropdown */}
      <select
        value={selectedChiefdom}
        onChange={(e) => {
          setSelectedChiefdom(e.target.value);
          setSelectedFacility("");
        }}
        disabled={!chiefdoms}
      >
        <option value="">Select Chiefdom</option>
        {chiefdoms?.map((ch) => (
          <option key={ch.name} value={ch.name}>
            {ch.name}
          </option>
        ))}
      </select>

      {/* Facility dropdown */}
      <select
        value={selectedFacility}
        onChange={(e) => setSelectedFacility(e.target.value)}
        disabled={!facilities}
      >
        <option value="">Select Facility</option>
        {facilities?.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CascadingDropdowns;