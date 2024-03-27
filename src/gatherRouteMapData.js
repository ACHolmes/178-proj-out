import gatherDefaultMapData from "./gatherDefaultMapData";
import route_data from "./data/data_by_route.json";

const minThreshold = 20;

const gatherRouteMapData = (liveBusData, selectedRoute, fastestRoutes, setRoutes, setStops, setBuses) => {

  // OPTION 1: If there's a live bus that matches the selected bus trip id, PERFECT. SHOW THAT ONE AND NOTHING ELSE
  liveBusData.forEach((bus) => {
    if (bus.vehicle.trip.trip_id === selectedRoute.tripId) {
      return gatherDefaultMapData([bus], fastestRoutes, setRoutes, setStops, setBuses);
    }
  })

  // OPTION 2: No live bus with current trip ID, BUT the selected bus arrival time is soon (<minThreshold mins).
  // DISPLAY ALL BUSES ON THE ROUTE OF THE BUS WE ARE LOOKING FOR IF ANY ARE CURRENTLY ACTIVE.
  // Idea here being: one of those buses is likely about to finish its trip, and will be the bus the user wants.
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
    // If here, we should check live buses in case any of them are on the correct route
    const cur_buses = liveBusData.filter((bus) => {
      return (bus.vehicle.trip.trip_id in route_data[selectedRoute.route].trips);
    })
    // If we found buses on the correct route, display those!
    if (cur_buses.length > 0) {
      return gatherDefaultMapData(cur_buses, fastestRoutes, setRoutes, setStops, setBuses);
    }
    // NOTE: Kinda want like a 'next_trip_id' for each bus, maybe this is doable, maybe not
  }

  // OPTION 3: Bus is not arriving within minThreshold minutes, so we are likely using schedule feature, or
  // just no relevant bus info to display currently. Let's just display the route and its stops.
  // To do so, we create a fake bus that we won't show to fit in with the default map data system.
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

  // These are ACTIVE, but should be HIDDEN. We are interested in the INACTIVE bus.
  // We still keep these though, as they may be running to stops that we should display
  // and I want to show those as currently active routes at those stops.
  const current_buses = liveBusData.map((bus) => {
    return {
      ...bus,
      inactive: false,
      hidden: true
    }
  })

  // Use the default map system with our fake bus (INACTIVE and HIDDEN, will show route and stops)
  // And the other buses                          (ACTIVE   and HIDDEN, will just show in stop info of stops the bus of interest stops at)
  return gatherDefaultMapData([fake_bus, ...current_buses], fastestRoutes, setRoutes, setStops, setBuses);

};

export default gatherRouteMapData;