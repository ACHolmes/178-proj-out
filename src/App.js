import './App.css';

import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
      console.log(response);
      const result = await response.json();
      setData(result);
    };

    const interval = setInterval(fetchData, 2000); // Fetch data every 2 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
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
