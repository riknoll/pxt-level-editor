import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';

interface State {
    tiles: Tile[],
}

export class ToolboxItemPanel extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props);

        this.state = {
            tiles: [
                { name: "Ham", image: <SpriteSheet height={32} image={'./gallery-icons/bigFood/big.png'} index={0} finalSize={48} /> },
                { name: "Cake", image: <SpriteSheet height={32} image={'./gallery-icons/bigFood/big.png'} index={5} finalSize={48} /> }
            ]
        }
    }

    render() {
        return (
            <ToolboxPanel title="Item">
                <ToolboxPanelGrid tiles={this.state.tiles} ></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}