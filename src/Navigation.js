import './App.css';
import React, { useState, useEffect } from 'react';
import timetableData from './data/stops_data.json';

const Navigation = () => {
  const [fastestRoutes, setFastestRoutes] = useState([]);
  const [liveData, setData] = useState(null);
  const [showJson, setShowJson] = useState(false);

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

    useEffect(() => {
            if (liveData && timetableData) {
            calculateFastestRoutes();
            }
        }, [liveData]); // Add liveData as a dependency

    const calculateFastestRoutes = () => {
            if (!liveData || !timetableData) return;

            const fastestRoutesData = [];
            fastestRoutesData.push("1234234");
        setFastestRoutes(fastestRoutesData);
    };
            
        // liveData.entity.forEach(entity => {
        //   const vehicle = entity.vehicle;
        //   const { current_stop_sequence, stop_id, trip } = vehicle;

        // if (stop_id === "5049") {
        // const timetable = timetableData[stop_id];
        // if (timetable) {
        //     const currentTimetableEntry = timetable.find(entry => entry.trip_id === trip.trip_id && entry.stop_sequence === current_stop_sequence);
        //     if (currentTimetableEntry) {
        //     const { route_id, arrival_time } = currentTimetableEntry;

        //     const secStopEntry = timetableData["23509"].find(entry => entry.trip_id === trip.trip_id && entry.stop_sequence === 2);
        //     if (secStopEntry) {
        //         const { arrival_time: secArrivalTime } = secStopEntry;
        //         const travelTime = calculateTravelTime(arrival_time, secArrivalTime);

        //         const nextBusArrivalTime = estimateNextBusArrival(arrival_time);

        //         fastestRoutesData.push({
        //         route_id,
        //         total_travel_time: travelTime,
        //         next_bus_arrival_time: nextBusArrivalTime
        //         });
        //     }
        //     }
        // }
        // }


    // fastestRoutesData.sort((a, b) => a.total_travel_time - b.total_travel_time);
    //     setFastestRoutes(fastestRoutesData);
    // };

    const calculateTravelTime = (arrivalTime1, arrivalTime2) => {
    const time1 = new Date(`2000-01-01T${arrivalTime1}`).getTime();
    const time2 = new Date(`2000-01-01T${arrivalTime2}`).getTime();
    const travelTimeInMilliseconds = time2 - time1;
    const travelTimeInMinutes = Math.floor(travelTimeInMilliseconds / (1000 * 60));
    return travelTimeInMinutes;
    };

        const estimateNextBusArrival = (arrivalTime) => {
            const time = new Date(`2000-01-01T${arrivalTime}`).getTime();
            const nextBusArrivalTime = new Date(time + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return nextBusArrivalTime;
        };

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
        {fastestRoutes.length === 0 && <p>Loading...</p>}
        {fastestRoutes.length > 0 && (
            <div>
            <h2>Fastest Routes</h2>
            <ul>
                {fastestRoutes.map((route, index) => (
                <li key={index}>
                    Route {route.route_id}: Total Travel Time - {route.total_travel_time} minutes, Next Bus Arrival Time - {route.next_bus_arrival_time}
                </li>
                ))}
            </ul>
            </div>
        )}
        </div>
    );
};

export default Navigation;
