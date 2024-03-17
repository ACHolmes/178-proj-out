import React, { useState, useEffect } from 'react';
import Map from '../Map';
import route_data from '../../data/data5.json';

const MapWrapper = (props) => {
  const [data, setData] = useState(null);
  const [routes, setRoutes] = useState(null);

  const fetchData = async () => {
    const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
    const result = await response.json();
    if ("entity" in result) {

      // First setting up all the routes
      setRoutes([...new Set(result.entity.map((liveBus) => {
        for (let i = 0; i < route_data.length; i++) {
          // Finding data about the trip for each bus
          if (liveBus.vehicle.trip.trip_id in route_data[i].trips) {
            const trip_id =  liveBus.vehicle.trip.trip_id;
            const shape_id = route_data[i].trips[trip_id].shape_id;

            // Adding data to the liveBus data so that we can use it there
            liveBus.vehicle.route_data = {
              route_id:         route_data[i].route_id,
              route_short_name: route_data[i].route_short_name,
              route_long_name:  route_data[i].route_long_name,
              route_color:      route_data[i].route_color,
              route_text_color: route_data[i].route_text_color
            };

            // Everything we want to know to draw the route
            return {
              points:           route_data[i].shapes[shape_id].points,
              route_id:         route_data[i].route_id,
              route_short_name: route_data[i].route_short_name,
              route_long_name:  route_data[i].route_long_name,
              route_color:      route_data[i].route_color,
              route_text_color: route_data[i].route_text_color
            };
          }
        }
        // If now route that has a trip_id that matches trip_id we found, unknown, return blank result
        return {
          points: [],
          route_id: null,
          route_short_name: null,
          route_long_name: null,
          route_color: null,
          route_text_color: null
        };
      }))]);

      // Then setting the live bus data
      setData(result);
    } else {
      console.log("No entity returned by API. API either being refreshed, no bus data currently or I guess maybe got ratelimited or similar?");
    }
  };


  useEffect(() => {
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
          <Map height={props.height} width={props.width} buses={data.entity} routes={routes}></Map>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default MapWrapper;