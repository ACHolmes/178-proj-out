import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

/*
Using the quick start tutorial from here, just making it its own component.
https://medium.com/@yukthihettiarachchissck/getting-started-with-google-maps-api-in-react-js-1390b19d18f0
*/

const libraries = ['places'];
const mapContainerStyle = {
  width: '800px',
  height: '600px',
};
const center = {
  lat: 42.381867,
  lng: -71.125325,
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
      >
        <Marker position={center} />
      </GoogleMap>
    </>
  );
}

export default Map;