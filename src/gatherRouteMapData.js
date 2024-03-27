import gatherDefaultMapData from "./gatherDefaultMapData";
import route_data from "./data/data_by_route.json";

const minThreshold = 20;

const gatherRouteMapData = (liveBusData, selectedRoute, fastestRoutes, setRoutes, setStops, setBuses) => {

  liveBusData.forEach((bus) => {
    // If the bus we want to take is currently active (should generally be true when not using
    // schedule feature), can just ignore all the other data but otherwise treat as the normal case
    if (bus.vehicle.trip.trip_id === selectedRoute.tripId) {
      return gatherDefaultMapData([bus], fastestRoutes, setRoutes, setStops, setBuses);
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
  if ((arrivalDate - new Date()) < minThreshold * 60 * 1000) {
    // If here, we should check live buses in case any of them are on the correct route, if so, let's display those in case
    // one of them is actually the trip we want.
    const cur_buses = liveBusData.filter((bus) => {
      return (bus.vehicle.trip.trip_id in route_data[selectedRoute.route].trips);
    })
    if (cur_buses.length > 0) {
      return gatherDefaultMapData(cur_buses, fastestRoutes, setRoutes, setStops, setBuses);
    }
    // NOTE: Kinda want like a 'next_trip_id' for each bus, maybe this is doable, maybe not

  }

  // In this case, just display the route, no point showing buses
  const fake_bus = {
    vehicle: {
      vehicle: {
        id: "fake",
        label: "fake"
      },
      position: {
        latitude: 42.375518,
        longitude: -71.1155211,
        speed: 0,
        bearing: 0
      },
      occupancy_status: 7,
      current_stop_sequence: -1,
      stop_id: -1,
      timestamp: 1,
      trip: {
        trip_id: selectedRoute.tripId
      },
      route_data: {
        route_id: selectedRoute.route,
        route_short_name: "QYE",
        route_long_name: selectedRoute.routeName,
        route_color: "006600",
        route_text_color: "FFFFFF"
      }
    },
    hidden: true,
    inactive: true
  }

  console.log(selectedRoute);
  console.log("Creating fake bus!");
  // for now, just show everything, will update this shortly
  return gatherDefaultMapData([fake_bus], fastestRoutes, setRoutes, setStops, setBuses);

};

export default gatherRouteMapData;