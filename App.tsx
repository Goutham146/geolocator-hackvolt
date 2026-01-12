import React, { useState, useCallback } from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';
import { Coordinates } from './types';
import MapView from './components/MapView';
import CoordinateInput from './components/CoordinateInput';

const App: React.FC = () => {
  // Default to TKMCE College location or a neutral starting point (0,0)
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 8.9133, // TKMCE approximate latitude
    lng: 76.6344, // TKMCE approximate longitude
  });

  // State to hold Start Coordinates for distance measurement
  // (Previously named userLocation, effectively acts as the Start Point)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const handleLocationUpdate = useCallback((newCoords: Coordinates) => {
    setCoordinates(newCoords);
    // Reset start location visualization when searching for a new target place
    setUserLocation(null); 
  }, []);

  const handleMeasureDistance = useCallback((startCoords: Coordinates) => {
    setUserLocation(startCoords);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar / Control Panel */}
      <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-auto md:h-screen overflow-y-auto border-r border-slate-200">
        <header className="p-6 bg-blue-600 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-wide">GeoLocator</h1>
          </div>
          <p className="text-blue-100 text-sm">HACKVOLT</p>
        </header>

        <main className="flex-1 p-6 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 text-slate-700">
              <Navigation className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Input Coordinates</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Enter latitude and longitude in decimal degrees to locate a position on the map.
            </p>
            
            <CoordinateInput 
              onUpdate={handleLocationUpdate} 
              onMeasure={handleMeasureDistance}
            />
          </section>

          <section className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-blue-800">Instructions</h3>
                <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                  <li>Latitude must be between -90 and 90.</li>
                  <li>Longitude must be between -180 and 180.</li>
                  <li>Click "Distance" to measure the path between two points.</li>
                  <li>You can use your current location (GPS) or manually enter a start point.</li>
                  <li>The distance provided is the straight line distance between 2 points, not the actual distance.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="p-4 bg-slate-50 border-t text-center text-xs text-slate-400">
          HACKVOLT
        </footer>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-[60vh] md:h-screen bg-slate-100">
        <MapView 
          lat={coordinates.lat} 
          lng={coordinates.lng} 
          userLocation={userLocation}
        />
      </div>
    </div>
  );
};

export default App;