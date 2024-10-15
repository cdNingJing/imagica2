import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface TripMapProps {
  locations?: Location[];
}

const defaultLocations: Location[] = [
  { name: "上海", lat: 31.2304, lng: 121.4737 },
  { name: "大阪", lat: 34.6937, lng: 135.5023 },
  { name: "京都", lat: 35.0116, lng: 135.7681 },
  { name: "奈良", lat: 34.6851, lng: 135.8048 },
  { name: "大阪", lat: 34.6937, lng: 135.5023 },
  { name: "上海", lat: 31.2304, lng: 121.4737 }
];

const TripMap: React.FC<TripMapProps> = ({ locations = defaultLocations }) => {
  const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));

  return (
    <MapContainer bounds={bounds} style={{ height: '496px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lng]}>
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
      <Polyline 
        positions={locations.map(loc => [loc.lat, loc.lng])} 
        color="blue" 
      />
    </MapContainer>
  );
};

export default TripMap;