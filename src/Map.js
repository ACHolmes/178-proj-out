import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow, Popup} from '@react-google-maps/api';
import usermarker from "./static/usermarker.svg"
import bus_stop_raw from "./static/bus_stop.svg"
import stop_icon from "./static/bus_terminal.svg"
import stops_dict from "./data/stops_dict.json"
import { useState } from 'react';
const libraries = ['places', 'marker'];

// To import an entire folder
function importAll(r) {
  let images = {};
  r.keys().forEach((key) => {
    const colorKey = key.substring(2, 8);
    // console.log(colorKey)
    images[colorKey] = r(key);
  })
  return images;
}

// Trying to import all svgs for bus icons
const busIcons = importAll(
  require.context("./static/bus_icons", false, /\.svg$/)
);

// Map color to the appropriate bus icon
const busicon = (color) => {
  const colored_url = busIcons[color];
  // console.log(colored_url);
  return {
    url: colored_url,
    scaledSize: {
      height: 40,
      width: 40
    },
    anchor: {
      x: 20,
      y: 10
    }
  };
}

const busstop = {
  url: stop_icon,
  scaledSize: {
    height: 30,
    width: 30
  },
  anchor: {
    x: 15,
    y: 10
  }
}


// Setting center of the yard as default center
const default_map_center = {
  lat: 42.374361,
  lng: -71.116222,
};

// Removing default POIs and other markers
const styles = {
  default: [],
  hide: [
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road.local",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// Setting map options to remove some of the buttons (e.g. street-view) and restrict user (e.g. shouldn't
// be able to zoom mega far out, bad user experience trying to refind campus).
const mapOptions = {
  streetViewControl: false,
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  minZoom: 13,
  maxZoom: 18,
  // Apply style above to remove default markers etc
  styles: styles["hide"]
};

const Map = (props) => {
  // console.log("PROPS");
  // console.log(props.stops);

  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  const mapContainerStyle = {
    width: `${props.width}px`,
    height: `${props.height}px`,
  };

  // console.log(props.buses);

  const buses = props.buses.map((bus) => {
    return {
      "vehicle_id": bus.vehicle.vehicle.id,
      "occupancy": bus.vehicle.occupancy_status,
      "next_stop": stops_dict[bus.vehicle.stop_id].stop_name,
      "route_long_name": bus.vehicle.route_data.route_long_name,
      "route_short_name": bus.vehicle.route_data.route_short_name,
      "position": {
        "lat": bus.vehicle.position["latitude"],
        "lng": bus.vehicle.position["longitude"]
      },
      "radius": 30,
      "options": {
        strokeColor: `#${bus.vehicle.route_data.route_color}`,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: `#${bus.vehicle.route_data.route_color}`,
        fillOpacity: 0.65
      },
      "icon": busicon(bus.vehicle.route_data.route_color),
      "anchorPoint": {
        x: 0,
        y: -100
      }
    }
  });
  // console.log(buses);

  const routes = props.routes.map((route) => {
    return {
      "points": route.points.map((point) => {
        return {
          "lat": point["shape_pt_lat"],
          "lng": point["shape_pt_lon"]
        }
      }),
      "options": {
        geodesic: true,
        strokeColor: `#${route.route_color}`,
        strokeOpacity: 1.0,
        strokeWeight: 2
      }
    }

  })

  const updateSelectedBus = (bus) => {
    if (bus && selectedBus && bus.vehicle_id === selectedBus.vehicle_id) {
      if (bus.position.lat !== selectedBus.position.lat || bus.position.lng !== selectedBus.position.lng) {
        setSelectedBus(bus);
      }
    }
  }

  const { isLoaded: isMapLoaded, loadError: loadMapError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadMapError) {
    return <div>Error loading maps. Check API key configured correctly, and API quota limits.</div>;
  }

  if (!isMapLoaded) {
    return <div>Map loading...</div>;
  }

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={default_map_center}
        options={
          mapOptions
        }
      >

        {/* Draw each route! */}
        {
          routes.map((route, idx) => {
            return <Polyline key={idx} path={route.points} options={route.options}/>
          })
        }

        {/* Draw each bus! */}
        {
          buses.map((bus, idx) => {
            return <Marker
              key={idx}
              options={bus.options}
              position={bus.position}
              icon={bus.icon}
              radius={bus.radius}
              onClick={() => setSelectedBus(bus)}
              onPositionChanged={() => updateSelectedBus(bus)}
            />
          })
        }

        {
          props.userLocation &&
          <Marker
            position={props.userLocation}
            icon={usermarker}
          />
        }

        {
          props.stops &&  (
            Object.values(props.stops).map((stop, idx) => {
            return <Marker
              key={idx}
              position={stop.position}
              title={stop.stop_name}
              clickable={true}
              icon={busstop}
              onClick={() => setSelectedStop(stop)}
            />
          })
          )
        }

        {selectedBus && (
          <InfoWindow
            position={selectedBus.position}
            onCloseClick={() => setSelectedBus(null)}
            anchor={selectedBus}
          >
            <div>
              <h4 style={{marginTop: 0 + 'px', marginBottom: 0 + 'px'}}><u>{selectedBus.route_long_name}</u></h4>
              <div>Next stop: {selectedBus.next_stop}</div>
            </div>

          </InfoWindow>
        )}

        {selectedStop && (
          <InfoWindow
            position={selectedStop.position}
            onCloseClick={() => {console.log('here'); console.log(selectedStop); setSelectedStop(null)}}
          >

            <div>
              <h3 style={{marginTop: 0 + 'px', marginBottom: 0 + 'px', fontSize: 20 + 'px'}}>{selectedStop.stop_name}</h3>
              <u style={{marginBottom: 40 + 'px'}}>Active Routes:</u>
              <div style={{display: "flex", flexDirection: "column", width: 100 + '%'}}>
                {
                  Object.values(selectedStop.routes).map((route) => {
                    return <div style={{ backgroundColor: '#' + route.route_color, color: "#FFF", fontWeight: "900", fontSize: 16 + 'px', textAlign: "center", padding: "4px 4px 4px 4px"}}>
                      {route.route_long_name}
                      </div>
                  })
                }
              </div>
            </div>

          </InfoWindow>
        )}
      </GoogleMap>


    </>
  );
}

export default Map;