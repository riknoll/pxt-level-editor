import * as React from 'react';

import '../../css/toolbox.css';
import { Tile } from './toolboxTypes';
import { Panel } from '../Panel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

interface State {
    tiles: Tile[],
}

export class ToolboxItemPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "Treasure", image: <div>T</div> },
                { name: "Coin", image: <div>C</div> }
            ]
        }
    }

    render() {
        return (
            <Panel title="Item">
                <ToolboxPanelGrid tiles={this.state.tiles} ></ToolboxPanelGrid>
            </Panel>
        );
    }
}