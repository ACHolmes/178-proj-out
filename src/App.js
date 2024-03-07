import './App.css';
import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';

function App() {

  return (
    <div>
      {/* <button onClick={handleButtonClick}>
        {showJson ? 'Hide JSON' : 'Show JSON'}
      </button>
      {showJson ? (
        <div>
          {liveData ? (
            <pre>{JSON.stringify(liveData, null, 2)}</pre>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      ) : null} */}
      <Navigation />
    </div>
  );
}

export default App;
