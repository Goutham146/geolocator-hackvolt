import React, { useEffect, useRef } from 'react';
import { Coordinates } from '../types';

// We need to declare L as it's loaded via CDN in index.html
declare global {
  interface Window {
    L: any;
  }
}

interface MapViewProps extends Coordinates {
  userLocation: Coordinates | null;
}

const MapView: React.FC<MapViewProps> = ({ lat, lng, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const targetMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (mapInstanceRef.current) return;

    const L = window.L;

    // Create map instance
    const map = L.map(mapRef.current).setView([lat, lng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Initial target marker placeholder - content will be set by the second useEffect
    const marker = L.marker([lat, lng]).addTo(map);
    mapInstanceRef.current = map;
    targetMarkerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Updates
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    
    const map = mapInstanceRef.current;
    const L = window.L;

    // --- 1. Handle Target Marker (Point B) ---
    if (!targetMarkerRef.current) {
       targetMarkerRef.current = L.marker([lat, lng]).addTo(map);
    } else {
       targetMarkerRef.current.setLatLng([lat, lng]);
    }

    // Set loading state for Target
    targetMarkerRef.current.bindPopup(`
        <div class="text-center p-1">
            <div class="font-semibold text-slate-600 animate-pulse">Locating target...</div>
            <div class="text-xs text-slate-400 mt-1">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        </div>
    `);

    // Only open popup if not measuring distance (keep view clean)
    if (!userLocation) {
         targetMarkerRef.current.openPopup();
    }

    // Fetch Target Address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
            if (targetMarkerRef.current && data && data.display_name) {
                const parts = data.display_name.split(',');
                const mainName = parts[0];
                // Join next 3 parts for context (City, State, Country)
                const subText = parts.slice(1, 4).join(', ');

                targetMarkerRef.current.setPopupContent(`
                    <div class="text-center p-1 min-w-[160px]">
                        <div class="font-bold text-slate-900 text-sm mb-1">${mainName}</div>
                        <div class="text-xs text-slate-600 leading-snug mb-1">${subText}</div>
                        <div class="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                            Target: ${lat.toFixed(4)}, ${lng.toFixed(4)}
                        </div>
                    </div>
                `);
            }
        })
        .catch(err => {
            console.error("Target geocoding failed", err);
            // Fallback
            if (targetMarkerRef.current) {
                targetMarkerRef.current.setPopupContent(`
                    <div class="text-center">
                        <b>Target Location</b><br>
                        Lat: ${lat.toFixed(4)}<br>
                        Lng: ${lng.toFixed(4)}
                    </div>
                `);
            }
        });


    // --- 2. Handle Start Location (Point A) + Polyline ---
    if (userLocation) {
      // Add/Update Start Marker
      if (!userMarkerRef.current) {
        // Create a custom icon for the start point
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);'></div>",
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
      
      // Initial loading state for Start popup
      userMarkerRef.current.bindPopup(`
        <div class="text-center p-1">
            <div class="font-semibold text-slate-600 animate-pulse">Locating address...</div>
            <div class="text-xs text-slate-400 mt-1">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</div>
        </div>
      `).openPopup();

      // Reverse Geocoding for Start Location
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`)
        .then(res => res.json())
        .then(data => {
            if (userMarkerRef.current && data && data.display_name) {
                const parts = data.display_name.split(',');
                const mainName = parts[0];
                const subText = parts.slice(1, 3).join(', ');
                
                userMarkerRef.current.setPopupContent(`
                    <div class="text-center p-1 min-w-[160px]">
                        <div class="font-bold text-indigo-700 text-sm mb-1">${mainName}</div>
                        <div class="text-xs text-slate-600 leading-snug mb-1">${subText}</div>
                        <div class="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                            Start: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}
                        </div>
                    </div>
                `);
            }
        })
        .catch(err => {
            console.error("Start geocoding failed", err);
            if (userMarkerRef.current) {
                userMarkerRef.current.setPopupContent(`
                    <div class="text-center">
                        <b>Start Location</b><br>
                        Lat: ${userLocation.lat.toFixed(4)}<br>
                        Lng: ${userLocation.lng.toFixed(4)}
                    </div>
                `);
            }
        });

      // Draw Polyline
      const pointList = [
        new L.LatLng(userLocation.lat, userLocation.lng),
        new L.LatLng(lat, lng)
      ];

      // Remove existing polyline if any
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }

      // Create new polyline
      const polyline = new L.Polyline(pointList, {
        color: '#4f46e5', // Indigo color
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'distance-line'
      });
      
      polyline.addTo(map);
      polylineRef.current = polyline;

      // Calculate distance
      const distMeters = map.distance([userLocation.lat, userLocation.lng], [lat, lng]);
      const distKm = (distMeters / 1000).toFixed(2);
      
      // Bind a tooltip to the line that is always open
      polyline.bindTooltip(`${distKm} km`, {
        permanent: true, 
        direction: 'center',
        className: 'bg-white px-2 py-1 rounded shadow text-indigo-700 font-bold border border-indigo-100'
      }).openTooltip();

      // Fit bounds to show both points with padding
      const bounds = new L.LatLngBounds(pointList);
      map.fitBounds(bounds, { padding: [100, 100] });

    } else {
      // Clean up if userLocation is null
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      
      map.flyTo([lat, lng], 13, { duration: 1.5 });
    }

  }, [lat, lng, userLocation]);

  return (
    <div className="w-full h-full relative z-0">
       <div 
        ref={mapRef} 
        className="w-full h-full outline-none"
        style={{ zIndex: 0 }}
      />
      
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md text-xs z-[400] border border-slate-200 flex flex-col gap-1">
        <div className="font-semibold text-slate-500 mb-1">Target Coordinates</div>
        <div>Lat: {lat.toFixed(4)}</div>
        <div>Lng: {lng.toFixed(4)}</div>
        {userLocation && (
             <div className="mt-2 pt-2 border-t border-slate-200 text-indigo-600">
             <div className="font-semibold mb-1">Distance</div>
             <div className="text-lg font-bold">
               {(window.L && mapInstanceRef.current 
                  ? (mapInstanceRef.current.distance([userLocation.lat, userLocation.lng], [lat, lng]) / 1000).toFixed(2) 
                  : '...')
               } km
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MapView;