import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// King County, Washington — center of the county
const KING_COUNTY_CENTER = [47.4009, -121.9836];
const DEFAULT_ZOOM = 10;

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange }) {
  const hasMarker = lat !== null && lng !== null;

  return (
    <div>
      <div className="map-picker" style={{ height: '220px' }}>
        <MapContainer
          center={KING_COUNTY_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={onChange} />
          {hasMarker && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
      {hasMarker && (
        <div className="map-coords">
          <span>Ubicación seleccionada:</span>
          <span className="map-coord-badge">Lat {lat.toFixed(5)}</span>
          <span className="map-coord-badge">Lon {lng.toFixed(5)}</span>
        </div>
      )}
    </div>
  );
}
