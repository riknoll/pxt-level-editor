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
                { name: "Skelly", image: <SpriteSheet size={16} src={'./gallery-icons/space/space.png'} index={0} finalSize={48} /> },
                { name: "Asteroid", image: <SpriteSheet size={22} src={'./gallery-icons/castle/skelly.png'} index={0} finalSize={48} /> }
            ]
        }
    }

    render() {
        return (
            <Panel title="Spawners">
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </Panel>
        );
    }
}