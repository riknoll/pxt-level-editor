import * as React from 'react';
import '../css/editingTools.css';
import { EditButton } from './EditButton';
import { MapTools } from '../util';

export interface EditingToolsProps {
    onToolSelected: (tool: MapTools) => void;
    selected: MapTools;
}

interface ToolInfo {
    icon: string;
    tool: MapTools;
    title: string;
}

export class EditingTools extends React.Component<EditingToolsProps, {}> {
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
        this.props.onToolSelected(tool);
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
            },            {
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