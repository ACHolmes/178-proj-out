import './App.css';
import Navigation from './Navigation';
import MapWrapper from './MapWrapper';
import { DeviceFrameset } from 'react-device-frameset'
import 'react-device-frameset/styles/marvel-devices.min.css'

function App() {
  const [width, height] = [400, 600];
  return (
    <div className='display'>
      <div className='navDis'>
        <Navigation  />
      </div>
      <div style={{margin: "20px", display: "flex", flexDirection:"row", justifyContent: "center"}}>
        <MapWrapper width={width} height={height} />
      </div>
    </div>
  );
}

export default App;