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
    };

    // Anytime setUserInput completes, calculate new routes
    useEffect(() => {
        calculateRoutes();
    }, [userInput]);

    const timeDiff = (arrival, current) => {
        return (arrival - current) / (1000 * 60 * 60);
    }

    async function getNextBusArrival(route, startStop, destStop) {
        const foundTrips = [];

        const routeData = dataByRoute[route.toString()];
        if (!routeData) {
            console.log('can\'t find matching route');
            return null;
        }
        
        const currentTime = new Date();

        for (const tripId in routeData.trips) {
            const trip = routeData.trips[tripId];
            const stops = trip.stops;

            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i]
                if (stop.stop_name === startStop) {
                    const arrivalTime = new Date(
                        `${currentTime.toDateString()} ${stop.arrival_time}`
                    );
                    if ((arrivalTime > currentTime) && timeDiff(arrivalTime, currentTime) < 2) {
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
                    }
                }
            }
        }
        
        foundTrips.sort((a, b) => {
            const arrivalTimeA = new Date(`2000-01-01 ${a.arrivalTime}`);
            const arrivalTimeB = new Date(`2000-01-01 ${b.arrivalTime}`);
            return arrivalTimeA - arrivalTimeB;
        });
        
        return foundTrips;
    }

    async function fetchBusArrival(routes, startStop, destStop) {
        const allTrips = [];
        for (const route of routes) {
            const tripInfo = await getNextBusArrival(route, startStop, destStop);
            if (tripInfo) {
                allTrips.push(...tripInfo);
            }
        }
        allTrips.sort((a, b) => {
            const arrivalTimeA = new Date(`2000-01-01 ${a.arrivalTime}`);
            const arrivalTimeB = new Date(`2000-01-01 ${b.arrivalTime}`);
            return arrivalTimeA - arrivalTimeB;
        });
        setFastestRoutes(allTrips.slice(0,3));
    }

    const calculateRoutes = () => {
        const startStopId = stopMappings[userInput.start];
        const destinationStopId = stopMappings[userInput.destination];

        const startRoutes = routesPerStop[startStopId] || [];
        const destRoutes = routesPerStop[destinationStopId] || [];

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
            <ul>
                {fastestRoutes.map((trip, index) => (
                    <li key={index}>
                        <h5>Route {trip.routeName}</h5>
                        <p>Leaving at: {trip.arrivalTime}</p>
                        <p>Arriving at destination at: {trip.destArrivalTime}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Navigation;
