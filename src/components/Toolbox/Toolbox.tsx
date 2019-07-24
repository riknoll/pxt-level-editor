import * as React from 'react';
import { ToolboxGenericPanel } from './ToolboxGenericPanel';

import '../../css/toolbox.css';

export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%", height: "100%" }}>
                    <ToolboxGenericPanel SpriteType={"Terrains"} />
                    <ToolboxGenericPanel SpriteType={"Interactables"} />
                    <ToolboxGenericPanel SpriteType={"Items"} />
                    <ToolboxGenericPanel SpriteType={"Spawners"} />
                    <ToolboxGenericPanel SpriteType={"Areas"} />
                </div>
            </div>
        );
    }
}
