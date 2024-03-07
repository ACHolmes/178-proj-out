import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useEffect } from 'react';

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

const Map = () => {
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
      </GoogleMap>
    </>
  );
}

export default Map;