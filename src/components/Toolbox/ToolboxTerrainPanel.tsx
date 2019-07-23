import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

interface State {
    tiles: Tile[],
}

export class ToolboxTerrainPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "Grass", image: <SpriteSheet height={16} image={'./gallery-icons/castle/tile.png'} index={5} finalSize={48} /> },
                { name: "Flowers", image: <SpriteSheet height={16} image={'./gallery-icons/castle/tile.png'} index={1} finalSize={48} /> },
                { name: "Trees", image: <SpriteSheet height={32} image={'./gallery-icons/castle/tree.png'} index={0} finalSize={48} /> },
                { name: "Bushes", image: <SpriteSheet height={16} image={'./gallery-icons/castle/shrub.png'} index={0} finalSize={48} /> }
            ]
        }
    }

    render() {
        return (
            <ToolboxPanel expandedByDefault={true} title="Terrain">
                <ToolboxPanelGrid tiles={this.state.tiles} ></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}