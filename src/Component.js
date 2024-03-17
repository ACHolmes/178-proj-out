import React, { useState, useEffect } from 'react';
import timetableData from './data/timetable.json'; // Import the JSON file

function MyComponent() {
  const [dataKeys, setDataKeys] = useState([]);

  useEffect(() => {
    // Get all keys of the timetableData object
    const keys = Object.keys(timetableData);
    setDataKeys(keys);
  }, []);

  return (
    <div>
      <h1>Timetable Data Keys</h1>
      <ul>
        {dataKeys.map((key, index) => (
          <li key={index}>{key}</li>
        ))}
      </ul>
    </div>
  );
}

export default MyComponent;