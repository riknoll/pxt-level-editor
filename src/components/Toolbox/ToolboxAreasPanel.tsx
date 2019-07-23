import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import '../../css/toolbox.css';
import { Tile } from './toolboxTypes';
import { Panel } from '../Panel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

interface State {
    tiles: Tile[],
}

export class ToolboxAreasPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                {
                    name: "Wall", image: <div style={{
                        backgroundColor: "rgba(200,0,200,.3)",
                        height: "48px",
                        width: "48px",
                    }} />
                },
            ]
        }
    }

    render() {
        return (
            <Panel title="Areas">
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </Panel>
        );
    }
}
