import React, { useState, useEffect } from 'react';
import Map from './Map';
import gatherDefaultMapData from './gatherDefaultMapData';
import gatherRouteMapData from './gatherRouteMapData';
import gatherResultsMapData from './gatherResultsMapData';


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
    console.log("updating map data");
    console.log(props);
    if (liveBusData) {
      updateMapData(liveBusData, props.selectedRoute, props.fastestRoutes);
    }
  }, [liveBusData, props.selectedRoute, props.fastestRoutes] )

  // Updates all the map data
  const updateMapData = (liveBuses, selectedRoute, fastestRoutes) => {
    if (liveBuses) {
      if (selectedRoute) {
        // If we have a selected route, update data to display only that route
        gatherRouteMapData(liveBuses, selectedRoute, fastestRoutes, setRoutes, setStops, setBuses);
      } else if (fastestRoutes && fastestRoutes.length > 0) {
        // Otherwise, if we have searched but not yet made a selection, show all the options
        gatherResultsMapData(liveBuses, fastestRoutes, setRoutes, setStops, setBuses);
      } else {
        // Otherwise, show default options
        console.log(liveBuses);
        gatherDefaultMapData(liveBuses, fastestRoutes, setRoutes, setStops, setBuses);
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