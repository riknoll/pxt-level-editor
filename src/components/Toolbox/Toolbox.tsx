import * as React from 'react';
import { ToolboxGenericPanel } from './ToolboxGenericPanel';
import { Tile } from './toolboxTypes';

import '../../css/toolbox.css';
import { TileSet } from '../../tileset';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { MapRect } from '../../map';

interface ToolboxProps {
    tileset: TileSet,
    onChange: (tile: Tile) => void,
    onTileSelectionChange: (selection: MapRect) => void,
}

export class Toolbox extends React.Component<ToolboxProps, {}> {

    constructor(props: ToolboxProps) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox" id="toolbox">
                <div>
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Terrains"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Interactables"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Items"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Spawners"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Areas"} />
                    <ToolboxTerrainPanel
                        onChange={this.props.onTileSelectionChange}
                        tileset={this.props.tileset}
                    />
                </div>
            </div>
        );
    }
}
