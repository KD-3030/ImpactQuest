'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Quest {
  _id: string;
  title: string;
  description: string;
  location: {
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  category: string;
  impactPoints: number;
}

interface QuestMapProps {
  quests: Quest[];
  onQuestClick: (questId: string) => void;
}

export default function QuestMap({ quests, onQuestClick }: QuestMapProps) {
  // Default center (Mumbai, India - you can change this)
  const defaultCenter: [number, number] = [19.0760, 72.8777];
  const defaultZoom = 12;

  // Use first quest location if available, otherwise use default
  const center = quests.length > 0 
    ? [quests[0].location.coordinates[1], quests[0].location.coordinates[0]] as [number, number]
    : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {quests.map((quest) => (
        <Marker
          key={quest._id}
          position={[quest.location.coordinates[1], quest.location.coordinates[0]]}
          eventHandlers={{
            click: () => onQuestClick(quest._id),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{quest.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{quest.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {quest.category}
                </span>
                <span className="text-xs font-bold text-green-600">
                  +{quest.impactPoints} pts
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
