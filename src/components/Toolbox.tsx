import * as React from 'react';
import { Panel } from './Panel';
import '../css/toolbox.css';
import { ToolboxTerrainPanel } from './Toolbox/ToolboxTerrainPanel';
import { ToolboxItemPanel } from './Toolbox/ToolboxItemPanel';

export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                <div style={{ display: "block", width: "100%" }}>
                    <h2>Toolbox component</h2>
                    <ToolboxTerrainPanel></ToolboxTerrainPanel>
                    <ToolboxItemPanel></ToolboxItemPanel>
                </div>
            </div>
        );
    }
}