import gatherDefaultMapData from "./gatherDefaultMapData";
import route_data from "./data/data_by_route.json";

const gatherRouteMapData = (liveBusData, selectedRoute, setRoutes, setStops, setBuses) => {
  liveBusData.forEach((bus) => {
    // If the bus we want to take is currently active (should generally be true when not using
    // schedule feature), can just ignore all the other data but otherwise treat as the normal case
    if (bus.vehicle.trip.trip_id === selectedRoute.tripId) {
      return gatherDefaultMapData([bus], setRoutes, setStops, setBuses);
    }
  })
  // If we reach here, the current trip is not yet active.
  // Could be: using schedule, so route might not even be active
  // Or for example, starting from the quad: bus on approach to quad is still finishing the previous trip

  // Using a 'heuristic' I suppose: let's compare arrivalTime to current time - if within 20 mins, we should probably show
  // currently running buses. Otherwise, it's probably a schedule for the future, so current buses are a bit meaningless.

  const now = new Date();

  // Getting time into military time
  let [hrs, mins, secs_midi] = selectedRoute.arrivalTime.split(":");
  let [secs, midi] = secs_midi.split(" ");
  hrs = parseInt(hrs);
  console.log(midi);
  if (midi === "PM") {
    hrs += 12;
  }
  const military_time = [hrs, mins, secs];
  // Set the arrival date object
  const arrivalDate = new Date().setHours(...military_time);

  // Check within twenty mins of current time
  if ((arrivalDate - new Date()) < 20 * 60 * 1000) {
    // If here, we should check live buses in case any of them are on the correct route, if so, let's display those in case
    // one of them is actually the trip we want.
    const cur_buses = liveBusData.filter((bus) => {
      return (bus.vehicle.trip.trip_id in route_data[selectedRoute.route].trips);
    })
    return gatherDefaultMapData(cur_buses, setRoutes, setStops, setBuses);
    // NOTE: Kinda want like a 'next_trip_id' for each bus, maybe this is doable, maybe not

  } else {
    // In this case, just display the route, no point showing buses

    // for now, just show everything, will update this shortly
    return gatherDefaultMapData(liveBusData, setRoutes, setStops, setBuses);


  }

};

export default gatherRouteMapData;