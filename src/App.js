import './App.css';
import Navigation from './Navigation';
import MapWrapper from './MapWrapper';
import Timeline from './Timeline';
import RouteOptions from './RouteOptions';
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'


const dumbRoutes = [ // very dumb, will probably have to restructure
  { name: 'Route 1', eta: 'arriving in X mins', travel: '10 mins' },
  { name: 'Route 1', eta: 'arriving in X mins', travel: '14 mins' },
  { name: 'Route 1', eta: 'arriving in X mins', travel: '22 mins' },
  { name: 'Route 1', eta: 'arriving in X mins', travel: '30 mins' },
];

function App() {
  const [width, height] = [375, 812];
  return (
    <div>
      <Navigation />
      {/* <Timeline stops={dumbStops}  />
      <RouteOptions routes={dumbRoutes}/> */}
      <div style={{display: "flex", flexDirection:"row", width: "100%", justifyContent: "center"}}>
        <DeviceFrameset device="iPhone X" width={width} height={height} zoom={0.9}>
          <MapWrapper width={width} height={height} />
        </DeviceFrameset>
      </div>
    </div>
  );
}

export default App;