import route_data from './data/data5.json';

const gatherDefaultMapData = (liveBusData, setRoutes, setStops, setBuses) => {

  // First setting up all the routes
  const new_routes = [...new Set(liveBusData.map((liveBus) => {
    for (let i = 0; i < route_data.length; i++) {
      // Finding data about the trip for each bus
      if (liveBus.vehicle.trip.trip_id in route_data[i].trips) {
        const trip_id =  liveBus.vehicle.trip.trip_id;
        const shape_id = route_data[i].trips[trip_id].shape_id;

        // Adding data to the liveBus data so that we can use it there
        liveBus.vehicle.route_data = {
          route_id:         route_data[i].route_id,
          route_short_name: route_data[i].route_short_name,
          route_long_name:  route_data[i].route_long_name,
          route_color:      route_data[i].route_color,
          route_text_color: route_data[i].route_text_color
        };

        // Everything we want to know to draw the route
        return {
          points:           route_data[i].shapes[shape_id].points,
          route_id:         route_data[i].route_id,
          route_short_name: route_data[i].route_short_name,
          route_long_name:  route_data[i].route_long_name,
          route_color:      route_data[i].route_color,
          route_text_color: route_data[i].route_text_color
        };
      }
    }
    // If now route that has a trip_id that matches trip_id we found, unknown, return blank result
    liveBus.vehicle.route_data = {
      route_id: null,
      route_short_name: "",
      route_long_name: "",
      route_color: "000000",
      route_text_color: "000000"
    }
    return {
      points: [],
      route_id: null,
      route_short_name: "",
      route_long_name: "",
      route_color: "000000",
      route_text_color: "000000"
    };
  }))];


  // Getting all stops that these routes hit
  const new_route_stops = {};

  liveBusData.forEach((liveBus) => {
    for (const route_info of route_data) {
      for (const trip_info of Object.values(route_info.trips)) {
        // If we found route that matches trip of this live bus, need to update stops
        if (trip_info.trip_id == liveBus.vehicle.trip.trip_id) {
          // For each stop on this trip
          trip_info.stops.forEach((stop) => {
            // If we already have the stop, just need to update the routes for this stop
            if (stop.stop_id in new_route_stops) {
              new_route_stops[stop.stop_id].routes[route_info.route_id] = route_info;
            } else {
              // Else we need to create a new stop and add in all the info
              new_route_stops[stop.stop_id] = {
                stop_id: stop.stop_id,
                stop_code: stop.stop_code,
                stop_name: stop.stop_name,
                position: {
                  lat: stop.stop_lat,
                  lng: stop.stop_lon
                },
                // Starting with the routes just including this first route we found
                routes: {
                  [route_info.route_id]: route_info
                }
              }
            }

          })
        }
      }
    }
  });

  // Then setting the live bus data
  setRoutes(new_routes);
  setStops(new_route_stops);
  setBuses(liveBusData);
};

export default gatherDefaultMapData;