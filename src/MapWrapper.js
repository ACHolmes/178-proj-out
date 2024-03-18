import React, { useState, useEffect } from 'react';
import Map from './Map';
import route_data from './data/data5.json';


const MapWrapper = (props) => {
  const [data, setData]     = useState(null);
  const [routes, setRoutes] = useState(null);
  const [stops, setStops]   = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(success, error);
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setUserLocation({ lat: latitude, lng: longitude });
    console.log(`user lat: ${latitude}, user lng: ${longitude}`);
  }

  function error(position) {
    console.log("unable to get current position, might not have location enabled on device.");
  }

  const fetchData = async () => {
    const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
    const result = await response.json();
    if ("entity" in result) {

      const liveBusData = result.entity;

      // First setting up all the routes
      const new_routes = [...new Set(liveBusData.map((liveBus) => {
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
        liveBus.vehicle.route_data = {
          route_id: null,
          route_short_name: "",
          route_long_name: "",
          route_color: "000000",
          route_text_color: "000000"
        }
        return {
          points: [],
          route_id: null,
          route_short_name: "",
          route_long_name: "",
          route_color: "000000",
          route_text_color: "000000"
        };
      }))];


      // Getting all stops that these routes hit
      const new_route_stops = [...new Set(liveBusData.map((liveBus) => {
        for (const route_info of route_data) {
          for (const trip_info of Object.values(route_info.trips)) {
            // TODO: Check whether this can be ===
            if (trip_info.trip_id == liveBus.vehicle.trip.trip_id) {
              return trip_info.stops.map((stop) => {
                return {
                  stop_id: stop.stop_id,
                  stop_code: stop.stop_code,
                  stop_name: stop.stop_name,
                  position: {
                    lat: stop.stop_lat,
                    lng: stop.stop_lon
                  }
                }
              })
            }
          }
        }
        return {};
      }).flat())];

      // Then setting the live bus data
      setRoutes(new_routes);
      setData(result);
      setStops(new_route_stops);
    } else {
      console.log("No entity returned by API. API either being refreshed, no bus data currently or I guess maybe got ratelimited or similar?");
      console.log(result);
    }
  };


  useEffect(() => {
    // Get initial data immediately
    fetchData();
    updateLocation();

    // Then update data every 2s
    const api_interval = setInterval(fetchData, 2000);
    const location_interval = setInterval(updateLocation, 2000);

    // Clean up interval on unmount
    return () => {
      clearInterval(api_interval);
      clearInterval(location_interval)
    };
  }, []);

  return (
    <>
      {
        <div>
          <Map
            height={props.height}
            width={props.width}
            buses={data ? (data.entity) : []}
            routes={routes ? routes : []}
            userLocation={userLocation && userLocation}
            stops={stops && stops}
            >

          </Map>
        </div>
      }
    </>
  );
}

export default MapWrapper;