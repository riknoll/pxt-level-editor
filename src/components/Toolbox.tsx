import * as React from 'react';
import { Panel } from './Panel';
import '../css/toolbox.css';
import { ToolboxTerrainPanel } from './Toolbox/ToolboxTerrainPanel';
import { ToolboxItemPanel } from './Toolbox/ToolboxItemPanel';
import { ToolboxSpawnersPanel } from './Toolbox/ToolboxSpawnersPanel';
import { ToolboxInteractablesPanel } from './Toolbox/ToolBoxInteractablesPanel';
export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%", height: "100%" }}>
                    <h2>Toolbox</h2>
                    <ToolboxTerrainPanel></ToolboxTerrainPanel>
                    <ToolboxItemPanel></ToolboxItemPanel>
                    <ToolboxSpawnersPanel></ToolboxSpawnersPanel>
                    <ToolboxInteractablesPanel />
                </div>
            </div>
        );
    }
}