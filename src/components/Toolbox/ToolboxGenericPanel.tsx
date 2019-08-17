import * as React from 'react';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';
import { Project } from '../../project';
import { dispatchChangeActiveLayer } from '../../actions/dispatch';
import { IStore } from '../../store/reducer';
import { Layer } from '../../map';
import { connect } from 'react-redux';

interface Props {
    onChange: (layer: Layer, index: number) => void;
    project: Project;
    selectedIndex: number;
    layer: Layer;
    dispatchChangeActiveLayer: (layer: Layer) => void;
    activeLayer: Layer;
}

interface State {
}

class ToolboxGenericPanelImpl extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { project, layer, activeLayer } = this.props;
        const sprites = project.templates[layer].map(p => p.sprite);

        return (
            <ToolboxPanel title={Layer[layer]} showHeader={activeLayer === null} expanded={activeLayer == layer} onTitleClick={this.onTitleClick}>
                <ToolboxPanelGrid onChange={index => this.props.onChange(layer, index)} selectedIndex={this.props.selectedIndex} sprites={sprites} onTileAdd={this.onTileAdd}/>
            </ToolboxPanel>
        );
    }

    protected onTileAdd = (v: string) => {
        const { project, layer } = this.props;
        project.newTemplate(layer, {
            src: v,
            name: `${Layer[layer]} ${project.templates[layer].length}`
        });

        project.loadImagesAsync()
            .then(() => {
                this.props.onChange(layer, project.templates[layer].length - 1);
            })
    }

    protected onTitleClick = () => {
        const { dispatchChangeActiveLayer, layer, activeLayer } = this.props;
        dispatchChangeActiveLayer(layer === activeLayer ? null : layer);
    }
}

function mapStateToProps(state: IStore) {
    if (!state) return {};
    return {
        activeLayer: state.activeLayer
    };
}

const mapDispatchToProps = {
    dispatchChangeActiveLayer
};

export const ToolboxGenericPanel = connect(mapStateToProps, mapDispatchToProps)(ToolboxGenericPanelImpl);