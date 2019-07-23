import * as React from 'react';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { ToolboxItemPanel } from './ToolboxItemPanel';
import { ToolboxSpawnersPanel } from './ToolboxSpawnersPanel';
import { ToolboxInteractablesPanel } from './ToolboxInteractablesPanel';
import { ToolboxAreasPanel } from './ToolboxAreasPanel';

import '../../css/toolbox.css';

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
