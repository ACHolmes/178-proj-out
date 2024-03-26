import React, { useState, useEffect } from 'react';
import Map from './Map';
import gatherDefaultMapData from './gatherDefaultMapData';


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
    // console.log(`user lat: ${latitude}, user lng: ${longitude}`);
  }

  function error(position) {
    console.log("unable to get current position, might not have location enabled on device.");
  }



  const fetchData = async () => {
    const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
    const result = await response.json();



    if ("entity" in result) {
      const liveBusData = result.entity;
      if (props.selectedRoute) {
        gatherRouteMapData(liveBusData, props.selectedRoute, setData, setROutes, setStops);
      } else {
        gatherDefaultMapData(liveBusData, setData, setRoutes, setStops);
      }

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
            selectedRoute={props.selectedRoute}
            >

          </Map>
        </div>
      }
    </>
  );
}

export default MapWrapper;