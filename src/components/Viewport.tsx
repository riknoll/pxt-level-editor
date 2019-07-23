import * as React from 'react';
import '../css/editingTools.css';
import { MapRect } from '../map';

interface ViewportProps {
    world: MapRect;
}

export class Viewport extends React.Component<ViewportProps, {}> {

    constructor(props: ViewportProps) {
        super(props);
    }

    render() {
        console.log(this.props.world)
        return <div className="viewport"></div>
    }
}