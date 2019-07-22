import * as React from 'react';
import { Tile } from './toolboxTypes';

import '../../css/toolbox-panel-grid.css';

interface Props {
    tiles: Tile[],
}

export class ToolboxPanelGrid extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    renderTile(tile: Tile) {
        return <div className="toolbox-panel-grid-tile" key={tile.name}>{tile.image}</div>
    }

    renderTiles() {
        return this.props.tiles && this.props.tiles.map((tile) => this.renderTile(tile));
    }

    render() {
        return (
            <div className="toolbar-panel-grid">
                {this.renderTiles()}
            </div>
        );
    }
}