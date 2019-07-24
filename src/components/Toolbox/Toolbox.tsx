import * as React from 'react';
import { ToolboxGenericPanel } from './ToolboxGenericPanel';
import { Tile } from './toolboxTypes';

import '../../css/toolbox.css';
import { TileSet } from '../../tileset';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';

interface ToolboxProps {
    tileset: TileSet,
    onChange: (tile: Tile) => void,
}

export class Toolbox extends React.Component<ToolboxProps, {}> {

    constructor(props: ToolboxProps) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%", height: "100%" }}>
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Terrains"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Interactables"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Items"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Spawners"} />
                    <ToolboxGenericPanel onChange={this.props.onChange} SpriteType={"Areas"} />
                    <ToolboxTerrainPanel tileset={this.props.tileset}/>
                </div>
            </div>
        );
    }
}
