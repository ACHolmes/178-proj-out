import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Button, Grid, TextField, Typography, Switch, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: '120px',
    width: '100%',
    fontFamily: 'Product Sans, sans-serif',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(1),
    width: '100%',
}));

function MapInputForm({ onSubmit }) {
    const [start, setStart] = useState('Quad');
    const [destination, setDestination] = useState('SEC');
    const [departureTime, setDepartureTime] = useState('');
    const [isDepartureScheduled, setIsDepartureScheduled] = useState(false);

    const handleStartChange = (event) => {
        setStart(event.target.value);
    };

    const handleDestinationChange = (event) => {
        setDestination(event.target.value);
    };

    const handleDepartureTimeChange = (event) => {
        setDepartureTime(event.target.value);
    };

    const handleToggleDepartureTime = () => {
        setIsDepartureScheduled(!isDepartureScheduled);
        // Reset departure time when toggled off
        if (!isDepartureScheduled) {
            setDepartureTime('');
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit({ start, destination, departureTime });
    };

    const stopOptions = [
        "1 Western Ave", "784 Memorial Drive", "Barry's Corner (Northbound)", "Barry's Corner (Southbound)",
        "Cambridge Common", "Harvard Square (Northbound)", "Harvard Square (Southbound)", "Kennedy School (Northbound)",
        "Kennedy School (Southbound)", "Lamont Library", "Law School (WCC)", "Leverett House", "Mass and Garden",
        "Mather House", "Maxwell Dworkin", "Memorial Hall", "Quad", "Radcliffe Yard", "Science Center", "SEC",
        "Sever Gate", "Stadium (Northbound)", "Stadium (Southbound)", "The Inn", "Widener Gate", "Winthrop House"
    ];

    const StartInput = () => {
      return <Grid item xs={12} md={6}>
      <StyledFormControl>
          <InputLabel>Start</InputLabel>
          <Select value={start} onChange={handleStartChange}>
              {stopOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
          </Select>
      </StyledFormControl>
      </Grid>
    }

    const DestinationInput = () => {
      return (<Grid item xs={12} md={6}>
        <StyledFormControl>
            <InputLabel>Destination</InputLabel>
            <Select value={destination} onChange={handleDestinationChange}>
                {stopOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>{option}</MenuItem>
                ))}
            </Select>
        </StyledFormControl>
    </Grid>)
    }
    const ScheduleToggle = () => {
      return <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">Schedule Departure Time</Typography>
                    <Switch checked={isDepartureScheduled} onChange={handleToggleDepartureTime} />
                </Box>
            </Grid>
    }

    const TimeInput = () => {
      return <Grid item xs={12} md={6}>
          <StyledTextField
              label="Departure Time"
              type="time"
              value={departureTime}
              onChange={handleDepartureTimeChange}
              InputLabelProps={{
                  shrink: true,
              }}
          />
      </Grid>
    }

    const SubmitButton = () => {
      return <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">Search</Button>
            </Grid>
    }

    return (
        <div>
            <Typography variant="h6" >Navigation</Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <StartInput />
                    <DestinationInput />
                    <ScheduleToggle />
                    {isDepartureScheduled && (
                        <TimeInput />
                    )}
                    <SubmitButton />
                </Grid>
            </form>
        </div>
    );
}

export default MapInputForm;
