import * as React from 'react';
import { Tile } from './toolboxTypes';
import { SpriteEditorButton } from './SpriteEditorButton';
import SpriteSheet from './SpriteSheet';

import '../../css/toolbox-panel-grid.css';

interface Props {
    onChange: (tile: Tile) => void;
    tiles: Tile[];
    onTileAdd: (spriteEditorValue : string) => void;
}
interface State {
    spriteEditorValue : string; 
}

export class ToolboxPanelGrid extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { spriteEditorValue : DEFAULT_SPRITE_STATE};
    }

    spriteEditorOnChange = (v: string) => {
        this.setState({spriteEditorValue : v})
        this.props.onTileAdd(v);
        console.log(v);
    }

    spriteClicked = (tile: Tile) => {
        return () => {
            this.props.onChange(tile);
        }
    }

    renderTile(tile: Tile) {
        return <div role="button" onClick={this.spriteClicked(tile)} className="toolbox-panel-grid-tile" key={tile.sprite.name}>
            <SpriteSheet Sprite={tile.sprite} finalSize={48} />
        </div>;
    }

    renderTiles() {
        return this.props.tiles && this.props.tiles.map((tile) => this.renderTile(tile));
    }

    render() {
        return (
            <div className="toolbar-panel-grid">
                <SpriteEditorButton onChange={this.spriteEditorOnChange} value= {this.state.spriteEditorValue} />
                {this.renderTiles()}
            </div>
        );
    }
}

const DEFAULT_SPRITE_STATE = `
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
`;