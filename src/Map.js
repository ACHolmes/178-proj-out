import { GoogleMap, useLoadScript, Marker, Polyline, Circle } from '@react-google-maps/api';
import usermarker from "../../static/usermarker.svg"
const libraries = ['places'];

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
    }
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

  const mapContainerStyle = {
    width: `${props.width}px`,
    height: `${props.height}px`,
  };

  const buses = props.buses.map((bus) => {
    return {
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
      }
    }
  });

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
          routes.map((route) => {
            return <Polyline path={route.points} options={route.options}/>
          })
        }

        {/* Draw each bus! */}
        {
          buses.map((bus) => {
            return <Circle
              options={bus.options}
              center={bus.position}
              radius={bus.radius}
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
      </GoogleMap>
    </>
  );
}

export default Map;