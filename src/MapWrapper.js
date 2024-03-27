import React, { useState, useEffect } from 'react';
import Map from './Map';
import gatherDefaultMapData from './gatherDefaultMapData';
import gatherRouteMapData from './gatherRouteMapData';


const MapWrapper = (props) => {
  const [liveBusData, setLiveBusData]   = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [routes, setRoutes]             = useState(null);
  const [stops, setStops]               = useState(null);
  const [buses, setBuses]               = useState(null);

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(success, error);
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setUserLocation({ lat: latitude, lng: longitude });
  }

  function error(position) {
    console.log("unable to get current position, might not have location enabled on device.");
  }

  // Updates the map data if the buses, or the selectedRoute gets updated
  useEffect(() => {
    if (liveBusData) {
      updateMapData(liveBusData, props.selectedRoute);
    }
  }, [liveBusData, props.selectedRoute] )

  // Updates all the map data
  const updateMapData = (liveBuses, selectedRoute) => {
    if (liveBuses) {
      if (props.selectedRoute) {
        gatherRouteMapData(liveBuses, selectedRoute, setRoutes, setStops, setBuses);
      } else {
        gatherDefaultMapData(liveBuses, setRoutes, setStops, setBuses);
      }
    }
  }

  // Fetches data and upadtes live buses via setBuses
  const fetchData = async () => {
    const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json');
    const result = await response.json();


    if (result.entity) {
      // updateMapData(result.entity, props.selectedRoute);
      setLiveBusData(result.entity);
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
            buses={buses ? buses : []}
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