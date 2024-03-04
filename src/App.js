import './App.css';

import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
      const result = await response.json();
      setData(result);
    };

    // Get initial data immediately
    fetchData();

    // Then update data every 2s
    const interval = setInterval(fetchData, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {data ? (
        <div>
          {JSON.stringify(data)}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
