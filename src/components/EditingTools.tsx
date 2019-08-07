import * as React from 'react';
import { connect } from 'react-redux';

import { IStore } from '../store/reducer'
import { dispatchChangeTool } from '../actions/dispatch'

import '../css/editingTools.css';
import { EditButton } from './EditButton';
import { MapTools } from '../util';

export interface EditingToolsProps {
    dispatchChangeTool: (tool: MapTools) => void;
    selected: MapTools;
}

interface ToolInfo {
    icon: string;
    tool: MapTools;
    title: string;
}

class EditingToolsComponent extends React.Component<EditingToolsProps, {}> {
    constructor(props: EditingToolsProps) {
        super(props);
    }

    render() {
        return (
            <div className="editingTools">
                {this.getTools().map(t =>
                    <EditButton
                        className={t.icon + (t.tool === this.props.selected ? " selected" : "")}
                        onClick={() => this.setTool(t.tool)}
                        id={MapTools[t.tool]}
                        key={MapTools[t.tool]}
                        title={t.title}/>
                )}
            </div>

        );
    }

    setTool(tool: MapTools) {
        this.props.dispatchChangeTool(tool);
    }


    protected getTools(): ToolInfo[] {
        return [
            {
                tool: MapTools.Object,
                title: "Object move tool",
                icon: "far fa-hand-paper",
            },
            {
                tool: MapTools.Stamp,
                title: "Stamp tool",
                icon: "fas fa-pencil-alt",
            },
            {
                tool: MapTools.Erase,
                title: "Erase tool",
                icon: "fas fa-eraser",
            },
            {
                tool: MapTools.Pan,
                title: "Canvas pan tool",
                icon: "fas fa-arrows-alt",
            }
        ]
    }
}

function mapStateToProps(state: IStore) {
    return {
        selected: state ? state.tool : null
    };
}

const mapDispatchToProps = {
    dispatchChangeTool
};

export const EditingTools = connect(mapStateToProps, mapDispatchToProps)(EditingToolsComponent);
