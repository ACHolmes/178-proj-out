import './App.css';
import MapWrapper from './components/MapWrapper';
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'

function App() {
  const [width, height] = [375, 812];

  return (
    <div style={{display: "flex", flexDirection:"row", width: "100%", justifyContent: "center"}}>
      <DeviceFrameset device="iPhone X" width={width} height={height} zoom={0.9}>
        <MapWrapper width={width} height={height}/>
      </DeviceFrameset>
    </div>
  );
}

export default App;