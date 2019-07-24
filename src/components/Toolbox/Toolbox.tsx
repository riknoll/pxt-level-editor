import * as React from 'react';
import { ToolboxGenericPanel } from './ToolboxGenericPanel';
import { Tile } from './toolboxTypes';
import { SpriteCategory } from '../SpriteStore';

import '../../css/toolbox.css';
import { TileSet } from '../../tileset';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { MapRect } from '../../map';

interface State {
    selectedTile?: Tile;
}

interface Props {
    tileset: TileSet,
    onChange: (tile: Tile) => void;
    onTileSelectionChange: (selection: MapRect) => void,
}

export class Toolbox extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    onChange = (tile: Tile) => {
        this.setState({ selectedTile: tile });
        this.props.onChange(tile);
    }

    renderPanel(category: SpriteCategory) {
        return (
            <ToolboxGenericPanel
                onChange={this.onChange}
                selectedTile={this.state.selectedTile}
                SpriteType={category}
            />);
    }

    render() {
        return (
            <div className="toolbox" id="toolbox">
                <div>
                    {this.renderPanel("Terrains")}
                    {this.renderPanel("Interactables")}
                    {this.renderPanel("Items")}
                    {this.renderPanel("Spawners")}
                    {this.renderPanel("Areas")}
                    <ToolboxTerrainPanel
                        onChange={this.props.onTileSelectionChange}
                        tileset={this.props.tileset}
                    />
                </div>
            </div>
        );
    }
}
