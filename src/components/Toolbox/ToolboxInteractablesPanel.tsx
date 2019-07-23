import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';

interface State {
    tiles: Tile[],
}

export class ToolboxInteractablesPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "House", image: <SpriteSheet size={48} src={'./gallery-icons/castle/house.png'} index={0} finalSize={48} /> },
                { name: "OtherHouse", image: <SpriteSheet size={48} src={'./gallery-icons/castle/house.png'} index={1} finalSize={48} /> }
            ]
        }
    }

    render() {
        return (
            <ToolboxPanel title="Interactables">
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}