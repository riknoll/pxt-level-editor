import * as React from "react";
import { connect } from "react-redux";

import { IconButton } from "./Button";
import { ImageEditorStore } from "./store/imageReducer";
import { dispatchChangeImageTool } from "./actions/dispatch";

import './css/sideBar.css'

interface TimelineProps {

}

export class TimelineImpl extends React.Component<TimelineProps,{}> {
    protected handlers: (() => void)[] = [];

    render() {
        const { } = this.props;
        return (
            <div className="image-editor-timeline">
            </div>
        );
    }

    protected clickHandler(tool: number) {
        if (!this.handlers[tool]) this.handlers[tool] = () => { };

        return this.handlers[tool];
    }
}

function mapStateToProps(state: ImageEditorStore) {
    if (!state) return {};
    return {
        selectedTool: state.tool
    };
}

const mapDispatchToProps = {
    dispatchChangeImageTool
};


export const Timeline = connect(mapStateToProps, mapDispatchToProps)(TimelineImpl);

