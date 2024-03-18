import './App.css';
import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Component from './Component';

function App() {
  const [width, height] = [375, 812];
  return (
    <div>
      <Navigation />
      <div style={{display: "flex", flexDirection:"row", width: "100%", justifyContent: "center"}}>
        <MapWrapper width={width} height={height}/>
      </div>
    </div>
  );
}

export default App;
