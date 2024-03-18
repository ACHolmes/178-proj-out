import './App.css';
import Navigation from './Navigation';
import MapWrapper from './MapWrapper';
import Timeline from './Timeline';
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'

const dumbStops = [ // very dumb, will probably have to restructure
  { name: 'Stop 1', time: '8:00 AM' },
  { name: 'Stop 2', time: '8:15 AM' },
  { name: 'Stop 3', time: '8:30 AM' },
  { name: 'Stop 4', time: '8:45 AM' },
];

function App() {
  const [width, height] = [375, 812];
  return (
    <div>
      <Navigation />
      <Timeline stops={dumbStops}  />
      <div style={{display: "flex", flexDirection:"row", width: "100%", justifyContent: "center"}}>
        <DeviceFrameset device="iPhone X" width={width} height={height} zoom={0.9}>
          <MapWrapper width={width} height={height} />
          {/* <Timeline stops={dumbStops} /> */}
        </DeviceFrameset>
      </div>
    </div>
  );
}

export default App;