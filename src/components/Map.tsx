import * as React from 'react';
import '../css/map.css';

export class Map extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="map">
                Tilemap / grid component
            </div>
        );
    }
}