import * as React from 'react';
import { Panel } from './Panel';

import '../css/toolbox.css';

export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%" }}>
                    <h2>Toolbox component</h2>
                    <Panel expandedByDefault={true} title="Terrain">Lots of Terrain</Panel>
                    <Panel title="Items">Sample Items</Panel>
                </div>
            </div>
        );
    }
}