import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';
import { Sprite, SpriteDictionary } from '../SpriteStore';

interface Props {
    SpriteType: 'Areas' | 'Interactables' | 'Items' | 'Spawners' | 'Terrains';
}

interface State {
    sprites: Sprite[],
    tiles: Tile[],
}

export class ToolboxGenericPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const sprites = SpriteDictionary[this.props.SpriteType];
        const tiles: Tile[] = sprites.map((sprite) => {
            return { image: <SpriteSheet Sprite={sprite} finalSize={48} /> };
        })
        this.state = {
            sprites,
            tiles,
        }
    }

    render() {
        return (
            <ToolboxPanel title={this.props.SpriteType}>
                <ToolboxPanelGrid tiles={this.state.tiles}></ToolboxPanelGrid>
            </ToolboxPanel>
        );
    }
}