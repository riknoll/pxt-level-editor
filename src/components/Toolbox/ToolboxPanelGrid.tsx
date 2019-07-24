import * as React from 'react';
import { Tile } from './toolboxTypes';
import { SpriteEditorButton } from './SpriteEditorButton';
import SpriteSheet from './SpriteSheet';

import '../../css/toolbox-panel-grid.css';

interface Props {
    onChange: (tile: Tile) => void;
    tiles: Tile[];
}

export class ToolboxPanelGrid extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    spriteEditorOnChange = (v: string) => {
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
                {this.renderTiles()}
                <SpriteEditorButton onChange={this.spriteEditorOnChange} />
            </div>
        );
    }
}