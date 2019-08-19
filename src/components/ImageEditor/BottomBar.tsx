import * as React from "react";
import './css/bottomBar.css'

import { connect } from 'react-redux';
import { ImageEditorStore } from './store/imageReducer';
import { dispatchChangeImageDimensions } from './actions/dispatch';
import { IconButton } from "./Button";

export interface BottomBarProps {
    dispatchChangeImageDimensions: (dimensions: [number, number]) => void;
    imageDimensions: [number, number];
    cursorLocation: [number, number];
}

export class BottomBarImpl extends React.Component<BottomBarProps, {}> {
    render() {
        const { imageDimensions, cursorLocation } = this.props;
        return (
            <div className="image-editor-bottombar">
                <div className="image-editor-resize">
                    <input className="image-editor-input" value={imageDimensions[0]}/>

                    <IconButton
                        onClick={null}
                        iconClass="fas fa-lock"
                        title="Lock Aspect Ratio"
                        toggle={true}
                        />

                    <input className="image-editor-input" value={imageDimensions[1]}/>
                </div>
                <div className="image-editor-coordinate-preview">
                    {cursorLocation && `${cursorLocation[0]}, ${cursorLocation[1]}`}
                </div>
                <div className="image-editor-undo-redo">
                    <IconButton
                        title="undo"
                        iconClass="fas fa-undo"
                        onClick={this.handleUndoClick}
                    />
                    <IconButton
                        title="redo"
                        iconClass="fas fa-redo"
                        onClick={this.handleRedoClick}
                    />
                </div>
            </div>
        );
    }

    protected handleUndoClick = () => {

    }

    protected handleRedoClick = () => {

    }
}

function mapStateToProps(state: ImageEditorStore) {
    if (!state) return {};
    return {
        imageDimensions: state.imageDimensions,
        cursorLocation: state.cursorLocation
    };
}

const mapDispatchToProps = {
    dispatchChangeImageDimensions
};


export const BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBarImpl);