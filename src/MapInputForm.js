import React, { useState } from 'react';

function MapInputForm({ onSubmit }) {
  // Define state variables for start and destination locations
  const [start, setStart] = useState('Quad');
  const [destination, setDestination] = useState('SEC');

  // Define function to handle start location change
  const handleStartChange = (event) => {
    setStart(event.target.value);
  };

  // Define function to handle destination location change
  const handleDestinationChange = (event) => {
    setDestination(event.target.value);
  };

  // Define function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Call the onSubmit callback function with form data
    onSubmit({ start, destination });
  };

  // Define array of stop options
  const stopOptions = [
    "1 Western Ave",
    "784 Memorial Drive",
    "Barry's Corner (Northbound)",
    "Barry's Corner (Southbound)",
    "Cambridge Common",
    "Harvard Square (Northbound)",
    "Harvard Square (Southbound)",
    "Kennedy School (Northbound)",
    "Kennedy School (Southbound)",
    "Lamont Library",
    "Law School (WCC)",
    "Leverett House",
    "Mass and Garden",
    "Mather House",
    "Maxwell Dworkin",
    "Memorial Hall",
    "Quad",
    "Radcliffe Yard",
    "Science Center",
    "SEC",
    "Sever Gate",
    "Stadium (Northbound)",
    "Stadium (Southbound)",
    "The Inn",
    "Widener Gate",
    "Winthrop House"
  ];

  return (
    <div>
      <h2>Google Maps Input</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start:</label>
          <select value={start} onChange={handleStartChange}>
            {/* Iterate through stopOptions and generate option elements */}
            {stopOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Destination:</label>
          <select value={destination} onChange={handleDestinationChange}>
            {/* Iterate through stopOptions and generate option elements */}
            {stopOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default MapInputForm;
