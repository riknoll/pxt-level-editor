import * as React from 'react';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';

import '../../css/toolbox.css';
import { MapObjectLayers } from '../../map';
import { Project } from '../../project';

interface Props {
    onChange: (layer: MapObjectLayers, index: number) => void;
    project: Project;
    selectedIndex: number;
    layer: MapObjectLayers;
}

interface State {
}

export class ToolboxGenericPanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { project, layer } = this.props;
        const sprites = project.templates[layer].map(p => p.sprite);

        return (
            <ToolboxPanel title={MapObjectLayers[layer]}>
                <ToolboxPanelGrid onChange={index => this.props.onChange(layer, index)} selectedIndex={this.props.selectedIndex} sprites={sprites} onTileAdd={this.onTileAdd}/>
            </ToolboxPanel>
        );
    }

    private onTileAdd = (v: string) => {
        const { project, layer } = this.props;
        project.newTemplate(layer, {
            src: v,
            name: `${MapObjectLayers[layer]} ${project.templates[layer].length}`
        });

        project.loadImagesAsync()
            .then(() => {
                this.props.onChange(layer, project.templates[layer].length - 1);
            })
    }

}