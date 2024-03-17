import './App.css';
import React, { useState, useEffect } from 'react';
import timetableData from '../../data/stops_data.json';

const Navigation = (props) => {
  const [fastestRoutes, setFastestRoutes] = useState([]);
  const [showJson, setShowJson] = useState(false);

  // Use this component in MapWrapper and just grab the data from props
  const liveData = props.buses;

  function handleButtonClick() {
    setShowJson(prevState => !prevState);
  };

  // Can run here, hoisted
  doCalculation();

  // code to run when fastestRoutes updates
  useEffect(() => {
    if (fastestRoutes) {
      console.log("Fastest routes updated!");
      console.log(fastestRoutes);
    }
  }, [fastestRoutes]);

  // Trying to understand your calculation (function not const for hoisting)
  function doCalculation() {
    // Start with empty fastest route data
    const fastestRoutesData = [];
    if (!liveData) return;

    // For each vehicle currently on live tracking
    liveData.entity.forEach(entity => {
      const vehicle = entity.vehicle;
      const { current_stop_sequence, stop_id, trip } = vehicle;

      // Not sure if this is the stop it's going to, or the stop it's coming from?
      if (stop_id === "5049") {
        // Look at timetable for that stop
        const timetable = timetableData[stop_id];
        if (timetable) {
          // Find the schedule for the trip id, so I guess stop_id is the stop it's going to?
          const currentTimetableEntry = timetable.find(entry => entry.trip_id === trip.trip_id && entry.stop_sequence === current_stop_sequence);
          console.log("step 1");

          // Never firing, so checkout logic above
          if (currentTimetableEntry) {
            // Get schedule arrival (/departure?) time
            const { route_id, arrival_time } = currentTimetableEntry;

            // Don't get the stop_sequence idea
            const secStopEntry = timetableData["23509"].find(entry => entry.trip_id === trip.trip_id && entry.stop_sequence === 2);
            console.log("step 2");
            if (secStopEntry) {
              console.log("step 3");
              const { arrival_time: secArrivalTime } = secStopEntry;
              // Travel time to SEC
              const travelTime = calculateTravelTime(arrival_time, secArrivalTime);

              const nextBusArrivalTime = estimateNextBusArrival(arrival_time);
              // Push data
              fastestRoutesData.push({
                route_id,
                total_travel_time: travelTime,
                next_bus_arrival_time: nextBusArrivalTime
              });
            }
          }
        }
      }
    });
    fastestRoutesData.sort((a, b) => a.total_travel_time - b.total_travel_time);
    setFastestRoutes(fastestRoutesData);
  };

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
    <>
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
    </>
  );
};

export default Navigation;
