import React, { useState } from 'react';
import './Timeline.css';

const Timeline = ({ stops }) => {

return (
<div class="container">
  <div class="wrapper">
    <h2> Route Timeline </h2>
    <ul class="sessions">
    {stops.map((stop, index) => (
      <div className="list-contain">
      <li>
        <div key={index} className="timeline-stop">
          <div className="stop-name">{stop.name}</div>
          <div className="stop-time">{stop.time}</div>
        </div>
      </li>
      </div>
      ))}
    </ul>
  </div>
</div> 
);
};

export default Timeline;

