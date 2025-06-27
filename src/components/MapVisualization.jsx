import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Dummy fixed coordinates for demo
const dummyCoords = {
  FacilityA: [7.9, -11.8],
  FacilityB: [8.0, -11.7],
  FacilityC: [8.1, -11.9],
  FacilityD: [7.85, -11.75],
};

const MapVisualizationSection = ({ medicines }) => {
  // Aggregate stock by facility
  const facilityStocks = medicines.reduce((acc, med) => {
    acc[med.facility] = (acc[med.facility] || 0) + med.stock;
    return acc;
  }, {});

  // Prepare markers with coords and stock
  const markers = Object.entries(facilityStocks).map(([facility, stock]) => {
    const position = dummyCoords[facility] || [7.95, -11.85]; // default center coords
    return { facility, stock, position };
  });

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-dhis2-border max-w-5xl mx-auto w-full h-[400px]">
      <h3 className="text-xl font-semibold mb-4 text-center text-dhis2-text">
        🗺️ Medicine Stock by Facility (Map)
      </h3>
      <MapContainer
        center={[7.95, -11.85]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ facility, stock, position }) => (
          <Marker key={facility} position={position}>
            <Popup>
              <strong>{facility}</strong>
              <br />
              Stock: {stock} units
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapVisualizationSection;