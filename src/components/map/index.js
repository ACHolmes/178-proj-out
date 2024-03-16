import { GoogleMap, useLoadScript, Marker, Polyline, Circle } from '@react-google-maps/api';

// const example_route = route_data[0]["shapes"]["48686"]["points"];
// const gmaps_route   = example_route.map((itm) => {
//   return {
//     "lat": itm["shape_pt_lat"],
//     "lng": itm["shape_pt_lon"]
//   }
// });

const route_options = {
  geodesic: true,
  strokeColor: "#FF0000",
  strokeOpacity: 1.0,
  strokeWeight: 2
};

const example_bus_options = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.35
}

/*
Using the quick start tutorial from here, just making it its own component.
https://medium.com/@yukthihettiarachchissck/getting-started-with-google-maps-api-in-react-js-1390b19d18f0

Map options here:
https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
*/

const libraries = ['places'];
const mapContainerStyle = {
  width: '800px',
  height: '600px',
};

// Setting Quad stop as the center, as it should be.
const center = {
  lat: 42.381867,
  lng: -71.125325,
};

/*
See https://developers.google.com/maps/documentation/javascript/style-reference#style-features
for info about posible featureTypes. This is just to get basically a clean map without all the Google Maps
default markers.
*/
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
  styles: styles["hide"]
};

const Map = (props) => {
  let gmap_bus_pos = null;

  console.log("routes, then buses coming up");
  console.log(props.routes);
  console.log(props.buses);

  // if (props.liveData) {
  //   const raw_bus_pos = props.liveData.entity[0].vehicle.position;
  //   gmap_bus_pos = {
  //     "lat": raw_bus_pos["latitude"],
  //     "lng": raw_bus_pos["longitude"]
  //   };
  // }

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
        center={center}
        options={
          mapOptions
        }
      >
        <Marker position={center} />

        {/*
          https://developers.google.com/maps/documentation/javascript/examples/polyline-simple for polyline example.
          To translate it to React, I just CTRL clicked Polyline and went searching in this TS files to find defintions for Polyline and what props it accepts.

        */}
        {/* <Polyline path={gmaps_route} options={route_options} />

        {props.liveData ? <Circle
          options={example_bus_options}
          center={gmap_bus_pos}
          radius={20}
        /> : ""} */}
      </GoogleMap>
    </>
  );
}

export default Map;