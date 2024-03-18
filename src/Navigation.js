import React, { useState, useEffect } from 'react';
import { Typography, Container, Box } from '@mui/material';
import MapInputForm from './MapInputForm';
import { styled } from '@mui/system';

// Styled Typography component with Product Sans font
const StyledTypography = styled(Typography)({
  fontFamily: 'Product Sans, sans-serif',
});

const Navigation = () => {
  const [fastestRoutes, setFastestRoutes] = useState([]);
  const [userInput, setUserInput] = useState({});
  const [searchClicked, setSearchClicked] = useState(false);

  useEffect(() => {
    // Mocking useEffect to set fastest routes for demo
    setFastestRoutes([
      { routeName: 'Route A', arrivalTime: '12:00 PM', destArrivalTime: '1:00 PM' },
      { routeName: 'Route B', arrivalTime: '12:30 PM', destArrivalTime: '1:30 PM' },
      { routeName: 'Route C', arrivalTime: '1:00 PM', destArrivalTime: '2:00 PM' },
    ]);
  }, []);

  const handleSearch = (data) => {
    setUserInput(data);
    setSearchClicked(true);
  };
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={4}>
      <StyledTypography variant="h4">PassioBetter</StyledTypography>
      <Container maxWidth="sm">
        <MapInputForm onSubmit={handleSearch} />
        {searchClicked && userInput.start && userInput.destination && (
          <>
            <p>Routes from {userInput.start} to {userInput.destination}</p>
            {fastestRoutes.length > 0 ? (
              <div>
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
            ) : (
              <p>No routes found.</p>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Navigation;
