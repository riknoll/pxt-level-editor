import * as React from 'react';

import '../../css/toolbox.css';
import { Tile } from './toolboxTypes';
import { Panel } from '../Panel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

interface State {
    tiles: Tile[],
}

export class ToolboxTerrainPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "Grass", image: <div>G</div> },
                { name: "Flowers", image: <div>F</div> },
                { name: "Trees", image: <div>T</div> },
                { name: "Pushes", image: <div>B</div> }
            ]
        }
    }

    render() {
        return (
            <Panel expandedByDefault={true} title="Terrain">
                <ToolboxPanelGrid tiles={this.state.tiles} ></ToolboxPanelGrid>
            </Panel>
        );
    }
}