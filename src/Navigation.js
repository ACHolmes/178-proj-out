import React, { useState, useEffect } from 'react';
import { Button, Typography, List, ListItem, ListItemText, Container, Box } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import MapInputForm from './MapInputForm';
import { styled } from '@mui/system';
import stopMappings from './data/stop_mappings.json';
import routeMappings from './data/route_name_mappings.json';
import routesPerStop from './data/routes_per_stop.json';
import dataByRoute from './data/data_by_route.json';
import LocationPinSvg from './static/location-pin.svg';
import RouteOptions from './RouteOptions';
import tripToRouteMapping from './data/trip_to_route_mapping.json'
import './Navigation.css';
import './Timeline.css';

// Styled Typography component with Product Sans font
const StyledTypography = styled(Typography)({
  fontFamily: 'Product Sans, sans-serif',
});

const StyledRoutes = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& h4': {
    marginBottom: theme.spacing(1),
  },
  '& li': {
    marginBottom: theme.spacing(2),
  },
}));

const StyledTimelineStop = styled('div')({
  marginBottom: '8px',
  padding: '4px',
  borderRadius: '4px',
  fontSize: '12px', // smaller font size for all stops
  fontWeight: 400, // normal font weight for all stops
  '& .stop-time': {
    marginLeft: '8px', // add space between stop name and time
  },
});

const Navigation = () => {
  const [fastestRoutes, setFastestRoutes] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [userInput, setUserInput] = useState({});
  const [searchClicked, setSearchClicked] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stopExpanded, setStopExpanded] = useState([]);

  const options = {hour: "numeric", minute: "numeric"};

  const handleStopClick = (index) => {
    setStopExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index]; // Toggle the expanded state of the clicked stop
      return newExpanded;
    });
  };

  const handleRouteClick = (index) => {
    setSelectedRoute((prevIndex) => (prevIndex === index ? null : index));
  };


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json');
      const result = await response.json();
      setLiveData(result);
    };

    // Get initial data immediately
    fetchData();

    // Then update data every 2s
    const interval = setInterval(fetchData, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (data) => {
    setUserInput(data);
    setSearchClicked(true); // Set searchClicked to true when search button is clicked
  };

  // Anytime setUserInput completes, calculate new routes
  useEffect(() => {
    calculateRoutes();
  }, [userInput]);

  const timeDiff = (arrival, current) => {
    return (arrival - current) / (1000 * 60 * 60);
  };

  function msToTime(ms) {
    const timestamp = ms * 1000; // Convert seconds to milliseconds

    // Create a new Date object using the provided timestamp
    const date = new Date(timestamp);

    // Extract the date and time components
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so we add 1
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    return date;
  }

  async function getNextBusArrival(route, startStop, destStop, depTime = null) {
    const foundTrips = [];
    let seenRoutes = new Set();
    console.log('fetching bus');
    // let alreadyFound = false;

    const routeData = dataByRoute[route.toString()];
    if (!routeData) {
      console.log('can\'t find matching route');
      return null;
    }
    const currentTime = new Date();
    const departureTime = (depTime) ?
      new Date(
        `${currentTime.toDateString()} ${depTime.toString()}`
      ) : new Date();
    for (const tripId in routeData.trips) {
      const trip = routeData.trips[tripId];
      const stops = trip.stops;
      
      // check whether bus is running on this day
      const currentDay = currentTime.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      if (!(trip.days.includes(currentDay))) {
        continue;
      }

      // TODO: check if bus is not currently running
      //

      for (let i = 0; i < stops.length; i++) {
        let startInd;
        let endInd;
        let route_stops = [];

        const stop = stops[i];
        if (stop.stop_name === startStop) {
          const startStopId = stop.stop_id;
          startInd = i;
          const arrivalTime = new Date(
            `${currentTime.toDateString()} ${stop.arrival_time}`
          );
          if ((arrivalTime > departureTime) && timeDiff(arrivalTime, departureTime) < 2) {
            for (let j = i + 1; j < stops.length; j++) {
              const next_stop = stops[j];
              if (next_stop.stop_name === destStop) {
                endInd = j; //edit
                for (let k = startInd; k <= endInd; k++) {
                  var obj = {};
                  const route_stop = stops[k];
                  const route_stopName = route_stop.stop_name;
                  const route_stopTime = route_stop.arrival_time
                  const newRoute_stopTime = new Date( `${currentTime.toDateString()} ${route_stopTime}`);
                  obj = { "name": route_stopName, "time": newRoute_stopTime.toLocaleTimeString("en-US", options)};
                  route_stops.push(obj);
                }
                const destArrivalTime = new Date(
                  `${departureTime.toDateString()} ${next_stop.arrival_time}`
                );
                const tripInfo = {
                  "route": route,
                  "routeName": routeMappings[route],
                  "tripId": tripId,
                  "arrivalTime": arrivalTime.toLocaleTimeString(),
                  "destArrivalTime": destArrivalTime.toLocaleTimeString(),
                  "startStopId": startStopId,
                  "stopsInfo": route_stops,
                  "nextTrips": [],
                };
                if (seenRoutes.has(route)) {
                  for (let i = 0; i < foundTrips.length; i++) {
                    if (foundTrips[i]["route"] == route) {
                      foundTrips[i]["nextTrips"].push(tripInfo);
                    }
                  }
                } else {
                  foundTrips.push(tripInfo);
                  seenRoutes.add(route);
                }
                
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
  async function fetchBusArrival(routes, startStop, destStop, departureTime = null) {
    const allTrips = [];
    for (const route of routes) {
      const tripInfo = await getNextBusArrival(route, startStop, destStop, departureTime);
      if (tripInfo) {
        allTrips.push(...tripInfo);
      }
    }
    allTrips.sort((a, b) => {
      const arrivalTimeA = new Date(`2000-01-01 ${a.arrivalTime}`);
      const arrivalTimeB = new Date(`2000-01-01 ${b.arrivalTime}`);
      return arrivalTimeA - arrivalTimeB;
    });

    // console.log('all trips are', allTrips);
    console.log('ALLTRIPS', allTrips);
    setFastestRoutes(allTrips);
  }

  const calculateRoutes = () => {
    const startStopId = stopMappings[userInput.start];
    const destinationStopId = stopMappings[userInput.destination];

    const startRoutes = routesPerStop[startStopId] || [];
    const destRoutes = routesPerStop[destinationStopId] || [];

    const sharedRoutes = startRoutes.filter(routeId => destRoutes.includes(routeId));
    if (sharedRoutes) {
      let departureTime = null;
      if (userInput.departureTime) {
        departureTime = userInput.departureTime;
        console.log('departing at ', departureTime);
      }
      fetchBusArrival(sharedRoutes, userInput.start, userInput.destination, departureTime);
    }
  };

  const LiveArrival = ({ tripInfo }) => {
    console.log('checking route', tripInfo.routeName, 'with trip id', tripInfo.tripId);

    // TODO: add some await Promise logic here when grabbing live data
    const liveBuses = liveData["entity"];
    let nextArrivalTime = null;
    let liveTrips = [];
    for (const busTrip of liveBuses) {
      liveTrips.push(busTrip["trip_update"]["trip"]["trip_id"]);
    }
    console.log(liveTrips);

    // iterate through all live trips
    for (const busTrip of liveBuses) {
      const busTripId = busTrip["trip_update"]["trip"]["trip_id"];
      // console.log('trip to route mapping is', tripToRouteMapping[busTripId]);
      // console.log(tripInfo.route);
      if (tripToRouteMapping[busTripId] == tripInfo.route) {
      // if it matches the timetable search result, find ETAs and append to tripInfo
      // if (busTripId == tripInfo.tripId) {
        console.log('we have a matching trip!')
        const stopUpdates = busTrip["trip_update"]["stop_time_update"];
        tripInfo["liveData"] = stopUpdates;
        console.log(stopUpdates);

        // augment the stop_times in the tripInfo dict
        for (const stopEntry of stopUpdates) {
          if (stopEntry["stop_id"] == tripInfo.startStopId) {
            nextArrivalTime = msToTime(stopEntry["arrival"]["time"]);
            console.log('next arrival to ', stopEntry["stop_id"], 'time is', nextArrivalTime);
            console.log('tripID', busTripId);
          }
        }
      }
    }

    if (nextArrivalTime != null) {
      return <p style={{color: "red"}}>Live ETA: {nextArrivalTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</p>
    } else {
      return <></>
    }
  }

  function getTravelTime(endTimeStr, startTimeStr) {
    const startTime = new Date(`2000-01-01 ${startTimeStr}`);
    const endTime = new Date(`2000-01-01 ${endTimeStr}`);

    const timeDiffMs = endTime - startTime;

    const timeDiffMinutes = Math.abs(timeDiffMs) / (1000 * 60);

    return timeDiffMinutes;
  }


  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={4} >
      <StyledTypography variant="h4">
        <a href="." style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={LocationPinSvg} alt="Location Pin" style={{ marginRight: '4px', width: '30px' }} />
          PassioBetter
        </a>
      </StyledTypography>

      <Container maxWidth="sm">
        <MapInputForm onSubmit={handleSearch} />
        {searchClicked && userInput.start && userInput.destination && (
        <StyledRoutes>
          {fastestRoutes.length > 0 ? (
            <>
            <List>
              <Typography variant="h6">Suggested routes:</Typography>
              {fastestRoutes.map((trip, index) => (
                <>
                {/* <LiveArrival tripInfo={trip} /> */}
                <ListItem className={selectedRoute === index ? 'selectedRoute' : ''}>
                  <div className="routeOption">

                <ListItemText
                    primary={`Route ${trip.routeName}`}
                    secondary={
                        <div>
                            <p>Leaving at: {trip.arrivalTime}</p>
                            <LiveArrival tripInfo={trip} />
                            <p>Arriving at destination at: {trip.destArrivalTime}</p>
                            {trip.nextTrips.length > 0 ? <p>Next arrival is scheduled for {trip.nextTrips[0].arrivalTime}</p> : <></>}
                        </div>
                    }
                    onClick={() => handleRouteClick(index)}
                    style={{ cursor: 'pointer', fontWeight: selectedRoute === index ? 'bold' : 'normal' }}
                />
              {selectedRoute === index && (
                  <div className="routeTL">
                    <ul className="sessions">
                      {/* Always render the first stop */}
                      <div className="list-contain">
                        <li>
                          <div className="timeline-stop">
                            <div className="stop-name">{trip.stopsInfo[0].name}</div>
                            <div className="stop-time">{trip.stopsInfo[0].time}</div>
                          </div>
                        </li>
                      </div>

                      {(trip.stopsInfo.length > 2) && (
                    <li>
                      <div className="timeline-stop ellipses" onClick={() => handleStopClick(index)}>
                        {stopExpanded[index] ? <ExpandLess /> : <ExpandMore />}
                        {/* Add label for total number of intermediate stops and time between arrival times */}
                        <span className="dropdown-label">
                          { stopExpanded[index] ? null : `${trip.stopsInfo.length - 2} stops, ${getTravelTime(trip.stopsInfo[trip.stopsInfo.length - 2].time, trip.stopsInfo[1].time)} minutes`}
                        </span>
                      </div>
                      {stopExpanded[index] &&
                        trip.stopsInfo.slice(1, -1).map((stop, i) => (
                          <div className="list-contain" key={i}>
                            <li>
                              <StyledTimelineStop className={`timeline-stop ${i === 0 ? 'first' : (i === trip.stopsInfo.length - 1 ? 'last' : 'intermediate')}`}>
                                <div className="stop-name">{stop.name}</div>
                                <div className="stop-time">{stop.time}</div>
                              </StyledTimelineStop>
                            </li>
                          </div>
                        ))
                      }
                    </li>
                  )}

                  {/* Always render the last stop */}
                  <div className="list-contain">
                    <li>
                      <div className="timeline-stop">
                        <div className="stop-name">{trip.stopsInfo[trip.stopsInfo.length - 1].name}</div>
                        <div className="stop-time">{trip.stopsInfo[trip.stopsInfo.length - 1].time}</div>
                      </div>
                    </li>
                  </div>
                </ul>
              </div> )}
                  </div>
                </ListItem>
                </>
              ))}
            </List>
            </>
          ) : (
            <Typography variant="body1">
              No routes found. :( Try searching from a different stop!
            </Typography>
          )}

        </StyledRoutes>
        )}

      </Container>
    </Box>
  );
};

export default Navigation;

