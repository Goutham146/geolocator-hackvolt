# GeoLocator Task 1A - Documentation

## 1. Working Principle

This application functions as a dynamic geographic visualization tool built using **React** and **Leaflet.js**. The core operating principle relies on a unidirectional data flow where user inputs drive the state of the map interface.

### Step-by-Step Logic:

1.  **Input Capture**: 
    - The user enters Latitude and Longitude values into standard HTML input fields.
    - React's `useState` hooks capture these keystrokes in real-time, storing them temporarily as strings to allow flexible editing (e.g., typing a negative sign).

2.  **Processing & Validation**:
    - When the "Locate" button is clicked, the application triggers a validation routine.
    - **Type Check**: It attempts to parse the strings into floating-point numbers. If this fails (NaN), an error is thrown.
    - **Range Check**: It verifies if the Latitude is within the standard geographic bounds of **-90 to +90 degrees** and Longitude within **-180 to +180 degrees**.
    - If validation fails, visual feedback (red border + error message) is displayed immediately.

3.  **Map Rendering & Update**:
    - Upon successful validation, the coordinates are passed to the `MapView` component via props.
    - Inside `MapView`, a `useEffect` hook detects the change in coordinates.
    - It calls the Leaflet API method `map.flyTo([lat, lng])` to smoothly animate the viewport to the new location.
    - Simultaneously, the existing marker is moved to the new coordinates using `marker.setLatLng()`, and a popup is updated with the new exact values.

## 2. Oral Evaluation Preparation

### Likely Questions & Answers

**Q1: Why did you choose React over vanilla JavaScript for this simple task?**
*Answer:* While vanilla JS works for simple scripts, React provides a structured, component-based architecture. This allows for better state management (handling the coordinates and errors consistently) and makes the code modular and scalable if we needed to add more features later, like saving location history.

**Q2: How do you handle invalid inputs, such as text or out-of-bounds numbers?**
*Answer:* I implemented a validation layer that runs before the map update triggers. It checks `isNaN()` to ensure inputs are numbers, and then compares them against the geodetic limits (-90/90 for Lat, -180/180 for Lng). If invalid, it prevents the state update and displays a specific error message to the user.

**Q3: How does the map update without refreshing the page?**
*Answer:* The map is controlled by a React `useEffect` hook. When the `lat` or `lng` props change, the hook fires. Inside the hook, I use the Leaflet instance's internal methods (`flyTo` and `setLatLng`) to imperatively update the map's internal state. This modifies the DOM elements inside the map container directly, providing a smooth transition without a full page reload.
