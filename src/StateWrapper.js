import Navigation from './Navigation';
import MapWrapper from './MapWrapper';
import { DeviceFrameset } from 'react-device-frameset'
import { useEffect, useState } from 'react';

const StateWrapper = () => {
  const [width, height] = [375, 812];
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [fastestRoutes, setFastestRoutes] = useState([]);

  return (
    <>
      <div className='navDis'>
        <Navigation selectedRoute={selectedRoute} setSelectedRoute={setSelectedRoute} fastestRoutes={fastestRoutes} setFastestRoutes={setFastestRoutes} />
      </div>
      <div style={{display: "flex", flexDirection:"row", width: "100%", justifyContent: "center"}}>
        <DeviceFrameset device="iPhone X" width={width} height={height} zoom={0.9}>
          <MapWrapper width={width} height={height} selectedRoute={selectedRoute} fastestRoutes={fastestRoutes} />
        </DeviceFrameset>
      </div>
    </>
  )
}
export default StateWrapper;