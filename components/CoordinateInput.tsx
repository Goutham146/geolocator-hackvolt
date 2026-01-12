import React, { useState, FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Search, LocateFixed, Loader2, Ruler, X, MapPin } from 'lucide-react';
import { Coordinates } from '../types';

interface CoordinateInputProps {
  onUpdate: (coords: Coordinates) => void;
  onMeasure: (coords: Coordinates) => void;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({ onUpdate, onMeasure }) => {
  // Target Inputs (Destination)
  const [latInput, setLatInput] = useState<string>('8.9133');
  const [lngInput, setLngInput] = useState<string>('76.6344');
  
  // Custom Start Inputs (Source)
  const [startLatInput, setStartLatInput] = useState<string>('');
  const [startLngInput, setStartLngInput] = useState<string>('');

  // UI State
  const [showDistancePanel, setShowDistancePanel] = useState<boolean>(false);
  const [distanceMode, setDistanceMode] = useState<'current' | 'custom'>('current');

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Loading States
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false); // For Target "Use Current"
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false); // For Distance Calculation

  // --- Helper: Validate Number ---
  const isValidCoordinate = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // --- Main Form Submit (Locate Target) ---
  const validateAndSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setShowDistancePanel(false); // Close distance panel to focus on map

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (!isValidCoordinate(lat, lng)) {
      setError('Invalid Target Coordinates. Lat: -90 to 90, Lng: -180 to 180.');
      return;
    }

    onUpdate({ lat, lng });
    setSuccessMsg(`Location updated to ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // --- "Use Current Location" for Target ---
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatInput(latitude.toString());
        setLngInput(longitude.toString());
        setSuccessMsg("Current location retrieved! Click 'Locate' to view.");
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve location.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- Handle Distance Calculation ---
  const handleCalculateDistance = () => {
    setError(null);
    
    // 1. Validate Target (Endpoint)
    const tLat = parseFloat(latInput);
    const tLng = parseFloat(lngInput);
    if (!isValidCoordinate(tLat, tLng)) {
        setError("Please set a valid Target Location first.");
        return;
    }

    setIsMeasuring(true);

    if (distanceMode === 'current') {
        // Option A: From GPS
        if (!navigator.geolocation) {
            setError("Geolocation is not supported.");
            setIsMeasuring(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onMeasure({ lat: latitude, lng: longitude });
                setSuccessMsg("Measured from your current location.");
                setIsMeasuring(false);
                setTimeout(() => setSuccessMsg(null), 3000);
            },
            (err) => {
                console.error(err);
                setError("Unable to retrieve your location for measurement.");
                setIsMeasuring(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

    } else {
        // Option B: From Custom Input
        const sLat = parseFloat(startLatInput);
        const sLng = parseFloat(startLngInput);

        if (!isValidCoordinate(sLat, sLng)) {
            setError("Invalid Start Coordinates. Please check your inputs.");
            setIsMeasuring(false);
            return;
        }

        onMeasure({ lat: sLat, lng: sLng });
        setSuccessMsg(`Measured from Custom Point (${sLat.toFixed(4)}, ${sLng.toFixed(4)}).`);
        setIsMeasuring(false);
        setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={validateAndSubmit} className="space-y-4">
        {/* Target Inputs */}
        <div className="space-y-1">
          <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
            Target Latitude
          </label>
          <input
            id="latitude"
            type="text"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            placeholder="e.g., 8.9133"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900 bg-white"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
            Target Longitude
          </label>
          <input
            id="longitude"
            type="text"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            placeholder="e.g., 76.6344"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900 bg-white"
          />
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Use Current (Populates Target) */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="col-span-2 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-300 transition-colors duration-200 shadow-sm active:transform active:scale-[0.98]"
          >
            {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            {isLoadingLocation ? 'Locating...' : 'Use Current Location'}
          </button>

          {/* Toggle Distance Panel */}
          <button
            type="button"
            onClick={() => setShowDistancePanel(!showDistancePanel)}
            className={`flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg border transition-colors duration-200 shadow-sm active:transform active:scale-[0.98] ${
                showDistancePanel 
                ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Distance
          </button>

          {/* Main Submit */}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg active:transform active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            Locate
          </button>
        </div>
      </form>

      {/* --- Distance Measurement Panel --- */}
      {showDistancePanel && (
        <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 shadow-inner animate-in slide-in-from-top-2 fade-in">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Measure Distance From:
                </h3>
                <button 
                    onClick={() => setShowDistancePanel(false)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Close Panel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-white rounded-lg border border-slate-200">
                <button 
                    type="button"
                    onClick={() => setDistanceMode('current')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        distanceMode === 'current' 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    My Location
                </button>
                <button 
                    type="button"
                    onClick={() => setDistanceMode('custom')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        distanceMode === 'custom' 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    Custom Point
                </button>
            </div>

            {/* Custom Inputs */}
            {distanceMode === 'custom' && (
                <div className="space-y-3 mb-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                             <label className="text-xs font-medium text-slate-500">Start Latitude</label>
                             <input 
                                type="text" 
                                value={startLatInput} 
                                onChange={e => setStartLatInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                                placeholder="0.00"
                             />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-medium text-slate-500">Start Longitude</label>
                             <input 
                                type="text" 
                                value={startLngInput} 
                                onChange={e => setStartLngInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                                placeholder="0.00"
                             />
                        </div>
                    </div>
                </div>
            )}

            {/* Calculate Button */}
            <button
                type="button"
                onClick={handleCalculateDistance}
                disabled={isMeasuring}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
            >
                {isMeasuring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ruler className="w-4 h-4" />}
                {isMeasuring ? 'Calculating...' : 'Calculate Distance'}
            </button>
        </div>
      )}
    </div>
  );
};

export default CoordinateInput;