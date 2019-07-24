import * as React from 'react';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';
import { Sprite, SpriteDictionary, SpriteCategory } from '../SpriteStore';

import '../../css/toolbox.css';

interface Props {
    onChange: (tile: Tile) => void;
    SpriteType: SpriteCategory;
}

interface State {
    sprites: Sprite[],
    tiles: Tile[],
}

export class ToolboxGenericPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        const sprites = SpriteDictionary[this.props.SpriteType];
        const tiles: Tile[] = sprites.map((sprite: Sprite) => {
            return { sprite, category: props.SpriteType } as Tile;
        })
        this.state = {
            sprites,
            tiles,
        }
    }

    render() {
        return (
            <ToolboxPanel title={this.props.SpriteType}>
                <ToolboxPanelGrid onChange={this.props.onChange} tiles={this.state.tiles} />
            </ToolboxPanel>
        );
    }
}