import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, Container, Box } from '@mui/material';
import MapInputForm from './MapInputForm';
import { styled } from '@mui/system';
import jsonTimetableData from './data/timetable.json';
import stopMappings from './data/stop_mappings.json';
import routeMappings from './data/route_name_mappings.json';
import routesPerStop from './data/routes_per_stop.json';
import dataByRoute from './data/data_by_route.json';
import LocationPinSvg from './static/location-pin.svg';
import RouteOptions from './RouteOptions';
import Collapsible from 'react-collapsible';
import Timeline from './Timeline';

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



const Navigation = () => {
  const [fastestRoutes, setFastestRoutes] = useState([]);
  const [liveData, setData] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [userInput, setUserInput] = useState({});
  const [timetableData, setTimetableData] = useState(null);
  const [searchClicked, setSearchClicked] = useState(false);

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
    setSearchClicked(true); // Set searchClicked to true when search button is clicked
  };

  // Anytime setUserInput completes, calculate new routes
  useEffect(() => {
    calculateRoutes();
  }, [userInput]);

  const timeDiff = (arrival, current) => {
    return (arrival - current) / (1000 * 60 * 60);
  };

  const timeToDate = (inputTime) => {
    const timeString = inputTime;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const [hours, minutes] = timeString.split(':').map(Number);

    const resultDate = new Date(year, month, day, hours, minutes);
    const localeTimeString = resultDate.toLocaleString();
    return localeTimeString;
  };

  async function getNextBusArrival(route, startStop, destStop, depTime = null) {
    const foundTrips = [];

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

      for (let i = 0; i < stops.length; i++) {
        let startInd;
        let endInd;
        let route_stops = [];

        // if (stop.stop_name === startStop) {
        //   startInd = i;
        // }

        // if (stop.stop_name === )
        
        const stop = stops[i];
        if (stop.stop_name === startStop) {
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
                  obj = { "name": route_stopName, "time": newRoute_stopTime.toLocaleTimeString()};
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
                  "stopsInfo": route_stops
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
    setFastestRoutes(allTrips.slice(0, 3));
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

  const SuggestedRoutes = ({ userInput, fastestRoutes }) => {
    return (
      <StyledRoutes>
        {fastestRoutes.length > 0 ? (
          <List>
            <Typography variant="h6">Suggested routes:</Typography>
            {fastestRoutes.map((trip, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Route ${trip.routeName}`}
                  secondary={`Leaving at: ${trip.arrivalTime}, Arriving at destination at: ${trip.destArrivalTime}`}
                />
                <Timeline stops={trip.stopsInfo}/>
              </ListItem>
              
            ))}
          </List>
        ) : (
          <Typography variant="body1">
            No routes found. :( Try searching from a different stop!
          </Typography>
        )}
        
      </StyledRoutes>
    );
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={4}>
      <StyledTypography variant="h4">
        <a href="." style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={LocationPinSvg} alt="Location Pin" style={{ marginRight: '4px', width: '30px' }} />
          PassioBetter
        </a>
      </StyledTypography>
      
      <Container maxWidth="sm">
        <MapInputForm onSubmit={handleSearch} />
        {searchClicked && userInput.start && userInput.destination && (
          <SuggestedRoutes userInput={userInput} fastestRoutes={fastestRoutes} />
          // <Timeline stops={fastestRoutes.tripInfo.stopsInfo}/>
        )}
        {/* <Timeline stops={fastestRoutes.tripInfo.stopsInfo}/> */}
      </Container>
    </Box>
  );
};

export default Navigation;

