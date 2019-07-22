import * as React from 'react';
import SpriteSheet from '../SpriteSheet';
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
                { name: "Ham", image: <SpriteSheet size={32} src={'./gallery-icons/bigFood/big.png'} index={0} finalSize={48} /> },
                { name: "Cake", image: <SpriteSheet size={32} src={'./gallery-icons/bigFood/big.png'} index={5} finalSize={48} /> }
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