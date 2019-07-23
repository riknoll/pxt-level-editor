import * as React from 'react';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { ToolboxItemPanel } from './ToolboxItemPanel';

import '../../css/toolbox.css';

export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%" }}>
                    <ToolboxTerrainPanel></ToolboxTerrainPanel>
                    <ToolboxItemPanel></ToolboxItemPanel>
                </div>
            </div>
        );
    }
}