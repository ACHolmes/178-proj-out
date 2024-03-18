import React from 'react';
import './RouteOptions.css';

const RouteOptions = ({routes}) =>  {
    return (
        <div className="route-selection-list">
            <h2>Route Selectors</h2>
        <div className="route-option">
            {routes.map((route, index) => ( //will reconfig to data formatting in the morn
            
            <div key={index} className="route-text">
                <div className="route-name">{route.name}</div>
                <div className="route-eta">{route.eta}</div>
                <div className='route-travel'>{route.travel}</div>
            </div>
            
            ))}
        </div>
        </div>
    )
};

export default RouteOptions;