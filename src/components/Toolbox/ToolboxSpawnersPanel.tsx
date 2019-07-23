import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';

interface State {
    tiles: Tile[],
}

export class ToolboxSpawnersPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "Skelly", image: <SpriteSheet size={16} src={'./gallery-icons/space/space.png'} index={0} finalSize={48} /> },
                { name: "Asteroid", image: <SpriteSheet size={22} src={'./gallery-icons/castle/skelly.png'} index={0} finalSize={48} /> }
            ]
        }
    }

    render() {
        return (
            <ToolboxPanel title="Spawners">
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}