import MapInputForm from './MapInputForm';
import React, { useState, useEffect } from 'react';
import jsonTimetableData from './data/timetable.json';
import stopMappings from './data/stop_mappings.json';
import routeMappings from './data/route_name_mappings.json';
import routesPerStop from './data/routes_per_stop.json';
import dataByRoute from './data/data_by_route.json';

const Navigation = () => {
    const [fastestRoutes, setFastestRoutes] = useState([]);
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
        // Or could just calculateRoutes(data) here.
        // Realizing that currently this state is overkill, could just pass as function parameter but it's ok.
    };

    // Anytime setUserInput completes, calculate new routes
    useEffect(() => {
        calculateRoutes();
    }, [userInput]);


    async function getNextBusArrival(route, startStop, destStop) {
        const foundTrips = [];

        // Index into route data if it exists
        const routeData = dataByRoute[route.toString()];
        if (!routeData) {
            console.log('can\'t find matching route');
            return null;
        }
        
        const currentTime = new Date();

        // Iterate through each trip in that route
        for (const tripId in routeData.trips) {
            const trip = routeData.trips[tripId];
            const stops = trip.stops;

            // Iterate through stops to find the specified stop
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i]
                if (stop.stop_name === startStop) {
                    const arrivalTime = new Date(
                        `${currentTime.toDateString()} ${stop.arrival_time}`
                    );
                    if (arrivalTime > currentTime) {
                        // check if will reach destination stop
                        for (let j = i + 1; j < stops.length; j++) {
                            const next_stop = stops[j];
                            if (next_stop.stop_name === destStop) {
                                const destArrivalTime = new Date(
                                    `${currentTime.toDateString()} ${next_stop.arrival_time}`
                                );
                                const tripInfo = { 
                                            "route": route,
                                            "routeName": routeMappings[route],
                                            "tripId" : tripId,
                                            "arrivalTime": arrivalTime.toLocaleTimeString(),
                                            "destArrivalTime": destArrivalTime.toLocaleTimeString()
                                };
                                foundTrips.push(tripInfo);
                                break;
                            }
                        }
                        
                    } else {
                        console.log('bus already came');
                    }

                }
            }
        }
        // return foundTrips;
        // sort routes by quickest arrival time
        foundTrips.sort((a, b) => {
            const arrivalTimeA = new Date(`2000-01-01 ${a.arrivalTime}`);
            const arrivalTimeB = new Date(`2000-01-01 ${b.arrivalTime}`);
            return arrivalTimeA - arrivalTimeB;
        });
        return foundTrips;
    }

    async function fetchBusArrival(routes, startStop, destStop) {
        for (const route of routes) {
            console.log('checking route', route, ' of ', routes );
            const tripInfo = await getNextBusArrival(route, startStop, destStop);
            if (tripInfo) {
                console.log('routes are', fastestRoutes);
                console.log('trip info is', tripInfo);
                setFastestRoutes(tripInfo);
            }
        }
    }

    // Function called whenever a search is fired
    const calculateRoutes = () => {
        const startStopId = stopMappings[userInput.start];
        const destinationStopId = stopMappings[userInput.destination];

        // find routes that go to each stop
        const startRoutes = routesPerStop[startStopId] || [];
        const destRoutes = routesPerStop[destinationStopId] || [];

        // get list of routes that go between start and dest stops
        const sharedRoutes = startRoutes.filter(routeId => destRoutes.includes(routeId));
        if (sharedRoutes) {
            fetchBusArrival(sharedRoutes, userInput.start, userInput.destination)
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
        <h4>Suggested routes:</h4>
        {fastestRoutes.map((trip) => (
            <p key={trip.tripId}>Route {trip.routeName}: Comes at {trip.arrivalTime} and arrives at destination at {trip.destArrivalTime} </p>
        ))}
        </div>
        );
};

export default Navigation;
