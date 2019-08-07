import * as React from 'react';
import { connect } from 'react-redux';

import { IStore } from '../../store/reducer';
import { dispatchChangeSelectedObjects, dispatchChangeSelectedTiles } from '../../actions/dispatch';

import { ToolboxGenericPanel } from './ToolboxGenericPanel';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { Project } from '../../project';
import { MapObjectLayers } from '../../map';

import '../../css/toolbox.css';

interface ToolboxState {
}

interface ToolboxProps {
    project: Project;
    selections: number[];
    dispatchChangeSelectedTiles: (selection: number[][]) => void;
    dispatchChangeSelectedObjects: (objects: number[]) => void;
}

class ToolboxComponent extends React.Component<ToolboxProps, ToolboxState> {
    constructor(props: ToolboxProps) {
        super(props);

        this.state = {};
    }

    private onChange = (layer: MapObjectLayers, index: number) => {
        const selectedObjects = this.props.selections.slice();
        selectedObjects[layer] = index;

        this.props.dispatchChangeSelectedObjects(selectedObjects);
    }

    renderPanel(layer: MapObjectLayers) {
        return (
            <ToolboxGenericPanel
                onChange={this.onChange}
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
                        onChange={this.props.dispatchChangeSelectedTiles}
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

function mapStateToProps(state: IStore) {
    return {
        selections: state && state.selectedObjects ? state.selectedObjects : []
    };
}

const mapDispatchToProps = {
    dispatchChangeSelectedObjects,
    dispatchChangeSelectedTiles
};

export const Toolbox = connect(mapStateToProps, mapDispatchToProps)(ToolboxComponent);