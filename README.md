Task 1A: Location Mapping - GeoLocator

Team Name: Hackvolt
Event: TKMCE Robocon '26 - Preliminary Round / HACKVOLT

1. Project Overview

This project is a responsive web application designed to map geographic coordinates using Latitude and Longitude. It allows users to manually input coordinates or fetch their current GPS location to visualize points on an interactive map.

Live Deployment URL: (https://geolocator-hackvolt.vercel.app/)

2. Tools & Libraries Used

Core Framework: React 19 (via Vite)

Language: TypeScript

Styling: Tailwind CSS (for responsive and glass-morphism UI)

Map Engine: Leaflet.js (Open-source mapping library)

Icons: Lucide-react

APIs Used:

OpenStreetMap (OSM): For map tiles.

Nominatim API: For reverse geocoding (converting coords to address names).

Browser Geolocation API: For fetching real-time user location.

3. Working Principle (Logic Explanation)

As required by the Task 1A Guidelines.

The application follows a Unidirectional Data Flow architecture using React State.

A. How Inputs are Captured

The user interface (CoordinateInput.tsx) presents two input fields for Latitude and Longitude.

We use React's useState hook (latInput, lngInput) to capture every keystroke.

Inputs are initially stored as strings. This is a deliberate design choice to allow users to type negative signs (-) or decimal points (.) without the input field forcing premature number formatting.

B. How Coordinates are Processed & Validated

When the user clicks the "Locate" button, the validateAndSubmit function is triggered:

Parsing: The string inputs are converted to floating-point numbers using parseFloat().

Validation Logic: Before updating the map, the code checks:

NaN Check: Ensures the input is actually a number.

Range Check:

Latitude must be between -90 and +90.

Longitude must be between -180 and +180.

Error Handling: If validation fails, an error state is set, displaying a red alert box. If successful, the onUpdate prop transmits the valid coordinates up to the parent App component.

C. How the Map Centers on the Location

The map rendering is handled in MapView.tsx:

Initialization: A useEffect hook initializes the Leaflet map instance on the first render, attaching it to a div ref.

Dynamic Updates: A second useEffect hook listens specifically for changes in the lat and lng props.

Animation: When coordinates change, the app executes map.flyTo([lat, lng], 13). This Leaflet method provides a smooth, cinematic pan-and-zoom animation to the new point, rather than an abrupt jump.

D. Marker Updates & Geocoding

Marker Movement: The existing marker is not destroyed but moved using marker.setLatLng(). This improves performance.

Reverse Geocoding: Asynchronously, the app fetches address data from the Nominatim API. Once the data returns, the marker's popup is updated to show the actual name of the location (e.g., "TKM College of Engineering") instead of just raw numbers.

4. Key Features

Smart Validation: Prevents the map from crashing by rejecting invalid coordinate ranges.

Current Location: Uses navigator.geolocation to auto-fill the user's GPS coordinates.

Distance Measurement: Calculates the straight-line distance (in km) between the user's current location and the target coordinate using the Haversine formula logic provided by Leaflet's distanceTo method.

Responsive Design: Fully functional on mobile devices with touch-friendly input targets.

5. Setup Instructions (For Local Evaluation)

To run this project locally:

Install Dependencies:

npm install


Run Development Server:

npm run dev


Open in Browser:
Navigate to http://localhost:3000 (or the port shown in terminal).

6. Screenshots

(Please refer to the 'screenshots' folder in the submission zip)

Input View: Showing validation of coordinates.

Map View: Showing the marker pinned on TKM College.

Distance View: Showing the polyline connecting two points.