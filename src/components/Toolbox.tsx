import * as React from 'react';
import { Panel } from './Panel';
import '../css/toolbox.css';
import { ToolboxTerrainPanel } from './Toolbox/ToolboxTerrainPanel';
import { ToolboxItemPanel } from './Toolbox/ToolboxItemPanel';
import { ToolboxSpawnersPanel } from './Toolbox/ToolboxSpawnersPanel';
import { ToolboxInteractablesPanel } from './Toolbox/ToolboxInteractablesPanel';
export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%", height: "100%" }}>
                    <h2>Toolbox</h2>
                    <ToolboxTerrainPanel />
                    <ToolboxItemPanel />
                    <ToolboxSpawnersPanel />
                    <ToolboxInteractablesPanel />
                    <ToolboxAreasPanel />
                </div>
            </div>
        );
    }
}
