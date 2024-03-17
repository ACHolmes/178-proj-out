import MapInputForm from './MapInputForm';
import React, { useState, useEffect } from 'react';
import jsonTimetableData from './data/timetable.json';
import stopMappings from './data/stop_mappings.json';
import routesPerStop from './data/routes_per_stop.json';
import dataByRoute from './data/data_by_route.json';

const Navigation = () => {
    const [routes, setRoutes] = useState([]);
    const [liveData, setData] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const [userInput, setUserInput] = useState({});
    const [timetableData, setTimetableData] = useState(null);


    useEffect(() => {
        setTimetableData(jsonTimetableData);
    }, []);

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

    const handleButtonClick = () => {
        setShowJson(prevState => !prevState);
    };

    const handleSearch = (data) => {
        setUserInput(data);
        calculateRoutes();
    };
    

    async function getNextBusArrival(route, stopId) {
        // Convert route to string
        const routeKey = route.toString();
        console.log('stop id is', stopId);
    
        // Check if the route exists in dataByRoute
        const keys = Object.keys(dataByRoute);
        if (!keys.includes(routeKey)) {
            // console.log('route key not present');
            return null;
        }
        
        const routeData = dataByRoute[routeKey];
        console.log('route data is', routeData);
        const currentTime = new Date();
    
        // res should be of form ["tripId1": "next bus arrival", "tripId5": "next bus arrival"]
        // let res = []
        let found = false;

        // Iterate through each trip in that route
        for (const tripId in routeData.trips) {
            // console.log('checking tripid ', tripId);
            const trip = routeData.trips[tripId];
            const stops = trip.stops;

            // Iterate through stops to find the specified stop
            for (const stop of stops) {
                console.log('checking stop ', stop);
                // console.log('stop_id', typeof stop.stop_id);
                console.log(typeof stopId);

                if (stop.stop_id === stopId) {
                    const arrivalTime = new Date(
                        `${currentTime.toDateString()} ${stop.arrival_time}`
                    );
                    // console.log(arrivalTime);
                    // console.log(currentTime);
                    // if valid (upcoming) arrival time, add it and associated tripId to return list
                    if (arrivalTime > currentTime) {
                        return (tripId, arrivalTime.toLocaleTimeString());
                    }
                    found = true;
                    break;
                }
            }
         
            if (found) break; // only 1 valid result per route
        }
        return null;
    }

    async function fetchBusArrival(routes, startStopId) {
        console.log('id is', startStopId);
        const results = [];
        for (const route of routes) {
            const res = await getNextBusArrival(route, startStopId);
            console.log("res is ", res);
            results.push(res);
        }
        return results;
    }

    const calculateRoutes = () => {
        const startStopId = stopMappings[userInput.start];
        console.log(startStopId);
        // console.log('startStopId', startStopId);
        const destinationStopId = stopMappings[userInput.destination];
        console.log('in calc routes function');
        
        // find routes that go to each stop 
        const startRoutes = routesPerStop[startStopId] || [];
        const destRoutes = routesPerStop[destinationStopId] || [];

        // get list of routes that go between start and dest stops
        const sharedRoutes = startRoutes.filter(routeId => destRoutes.includes(routeId));
        if (sharedRoutes) {
            fetchBusArrival(sharedRoutes, startStopId)
            .then(routes => {
                console.log(routes);
                setRoutes(routes);
            })
        }
        
    }

    return (
        <div>
            <button onClick={handleButtonClick}>{showJson ? 'Hide JSON' : 'Show JSON'}</button>
      {showJson && (
        <div>
          <h2>Live Data</h2>
          <pre>{JSON.stringify(liveData, null, 2)}</pre>
          <h2>Timetable Data</h2>
          <pre>{JSON.stringify(timetableData, null, 2)}</pre>
        </div>
      )}
        <h1>Live Map</h1>
        <MapInputForm onSubmit={handleSearch} />
        <p>looking for routes from {userInput.start} to {userInput.destination}</p>
        <p>{routes}</p>
        </div>
    );
};

export default Navigation;
