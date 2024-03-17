import './App.css';

import React, { useState, useEffect } from 'react';
import Map from './components/map';
import route_data from './data/data5.json';

function App() {
  const [data, setData] = useState(null);
  const [routes, setRoutes] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
      const result = await response.json();
      if ("entity" in result) {
        setData(result);

        setRoutes([...new Set(result.entity.map((liveBus) => {
          for (let i = 0; i < route_data.length; i++) {
            if (liveBus.vehicle.trip.trip_id in route_data[i].trips) {
              const trip_id =  liveBus.vehicle.trip.trip_id;
              const shape_id = route_data[i].trips[trip_id].shape_id;
              return {
                "points": route_data[i].shapes[shape_id].points,
                "route_id": 777,
                "route_short_name": "1636",
                "route_long_name": "1636'er",
                "route_color": "0099FF",
                "route_text_color": "FFFFFF"
              };
            }
          }
          return {points: []};
        }))])
      } else {
        console.log("No entity returned by API. API either being refreshed, no bus data currently or I guess maybe got ratelimited or similar?");
      }

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
      {data && routes ? (
        <div>
          {JSON.stringify(data)}

          <Map buses={data.entity} routes={routes}></Map>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;