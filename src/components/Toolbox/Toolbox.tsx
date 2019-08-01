import * as React from 'react';
import { ToolboxGenericPanel } from './ToolboxGenericPanel';

import '../../css/toolbox.css';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { Project } from '../../project';
import { MapObjectLayers } from '../../map';

interface State {
}

interface Props {
    project: Project;
    selections: number[];
    onChange: (layer: MapObjectLayers, index: number) => void;
    onTileSelectionChange: (selection: number[][]) => void;
}

export class Toolbox extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    renderPanel(layer: MapObjectLayers) {
        return (
            <ToolboxGenericPanel
                onChange={this.props.onChange}
                selectedIndex={this.props.selections[layer]}
                layer={layer}
                project={this.props.project}
            />);
    }

    render() {
        return (
            <div className="toolbox" id="toolbox">
                <div>
                    <ToolboxTerrainPanel
                        onChange={this.props.onTileSelectionChange}
                        project={this.props.project}
                    />
                    {this.renderPanel(MapObjectLayers.Decoration)}
                    {this.renderPanel(MapObjectLayers.Item)}
                    {this.renderPanel(MapObjectLayers.Interactable)}
                    {this.renderPanel(MapObjectLayers.Spawner)}
                    {this.renderPanel(MapObjectLayers.Area)}
                </div>
            </div>
        );
    }
}
