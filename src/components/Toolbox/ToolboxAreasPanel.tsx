import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';

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
            <ToolboxPanel title="Areas">
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}
