import gatherDefaultMapData from "./gatherDefaultMapData";

const gatherRouteMapData = (liveBusData, selectedRoute, setData, setRoutes, setStops) => {
  liveBusData.forEach((bus) => {
    // If the bus we want to take is currently active (should generally be true when not using
    // schedule feature), can just ignore all the other data but otherwise treat as the normal case
    if (bus.vehicle.trip.trip_id === selectedRoute.tripId) {
      return gatherDefaultMapData([bus], setData, setRoutes, setStops);
    }
  })
  // If we reach here, the current trip is not yet active.
  // Could be: using schedule, so route might not even be active
  // Or for example, starting from the quad: bus on approach to quad is still finishing the previous trip

  // Using a 'heuristic' I suppose: let's compare arrivalTime to current time - if within 20 mins, we should probably show
  // currently running buses. Otherwise, it's probably a schedule for the future, so current buses are a bit meaningless.

  const now = new Date();

  // Getting time into military time
  let [hrs, mins, secs_midi] = selectedBus.arrivalTime.split(":");
  let [secs, midi] = secs_midi.split(" ");
  hrs = parseInt(hrs);
  if (midi === "pm") {
    hrs += 12;
  }
  const military_time = [hrs, mins, secs];

  // Set the arrival date object
  const arrivalDate = new Date().setHours(...military_time);

  // Check within twenty mins of current time
  if (arrivalDate - new Date() < 20 * 60 * 1000) {
    // If here, we should check live buses in case any of them are on the correct route, if so, let's display those in case
    // one of them is actually the trip we want.

    // NOTE: Kinda want like a 'next_trip_id' for each bus, maybe this is doable, maybe not
    assert(false && "not yet done");

  } else {
    // In this case, just display the route, no point showing buses
    assert(false && "not yet done");
  }

};

export const gatherRouteMapData;