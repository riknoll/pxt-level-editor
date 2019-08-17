import * as React from 'react';
import { connect } from 'react-redux';

import { IStore } from '../../store/reducer';
import { dispatchChangeSelectedObjects, dispatchChangeSelectedTiles } from '../../actions/dispatch';

import { ToolboxGenericPanel } from './ToolboxGenericPanel';
import { ToolboxTerrainPanel } from './ToolboxTerrainPanel';
import { Project } from '../../project';
import { Layer } from '../../map';

import '../../css/toolbox.css';

interface ToolboxState {
}

interface ToolboxProps {
    project: Project;
    selections: number[];
    activeLayer: Layer;
    dispatchChangeSelectedTiles: (selection: number[][]) => void;
    dispatchChangeSelectedObjects: (objects: number[]) => void;
}

class ToolboxComponent extends React.Component<ToolboxProps, ToolboxState> {
    constructor(props: ToolboxProps) {
        super(props);

        this.state = {};
    }

    private onChange = (layer: Layer, index: number) => {
        const selectedObjects = this.props.selections.slice();
        selectedObjects[layer] = index;

        this.props.dispatchChangeSelectedObjects(selectedObjects);
    }

    renderPanel(layer: Layer) {
        return (
            <ToolboxGenericPanel
                onChange={this.onChange}
                selectedIndex={this.props.selections[layer]}
                layer={layer}
                project={this.props.project}
            /> );
    }

    render() {
        return (
            <div className="toolbox" id="toolbox">
                <div>
                    {<ToolboxTerrainPanel
                        onChange={this.props.dispatchChangeSelectedTiles}
                        project={this.props.project}
                    />}
                    {this.renderPanel(Layer.Decoration)}
                    {this.renderPanel(Layer.Item)}
                    {this.renderPanel(Layer.Interactable)}
                    {this.renderPanel(Layer.Spawner)}
                    {this.renderPanel(Layer.Area)}
                </div>
            </div>
        );
    }


    protected shouldRenderLayer(layer: Layer) {
        const { activeLayer } = this.props;
        return (activeLayer === null || activeLayer === layer);
    }
}

function mapStateToProps(state: IStore) {
    return {
        selections: state && state.selectedObjects ? state.selectedObjects : [],
        activeLayer: state.activeLayer
    };
}

const mapDispatchToProps = {
    dispatchChangeSelectedObjects,
    dispatchChangeSelectedTiles
};

export const Toolbox = connect(mapStateToProps, mapDispatchToProps)(ToolboxComponent);