import * as React from "react";
import './css/bottomBar.css'

import { connect } from 'react-redux';
import { ImageEditorStore } from './store/imageReducer';
import { dispatchChangeImageDimensions, dispatchUndoImageEdit, dispatchRedoImageEdit } from './actions/dispatch';
import { IconButton } from "./Button";

export interface BottomBarProps {
    dispatchChangeImageDimensions: (dimensions: [number, number]) => void;
    imageDimensions: [number, number];
    cursorLocation: [number, number];

    hasUndo: boolean;
    hasRedo: boolean;

    dispatchUndoImageEdit: () => void;
    dispatchRedoImageEdit: () => void;
}

export class BottomBarImpl extends React.Component<BottomBarProps, {}> {
    render() {
        const {
            imageDimensions,
            cursorLocation,
            hasUndo,
            hasRedo,
            dispatchUndoImageEdit,
            dispatchRedoImageEdit
        } = this.props;

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
                        title="Undo"
                        iconClass="fas fa-undo"
                        onClick={hasUndo ? dispatchUndoImageEdit : null}
                        disabled={!hasUndo}
                    />
                    <IconButton
                        title="Redo"
                        iconClass="fas fa-redo"
                        onClick={hasRedo ? dispatchRedoImageEdit : null}
                        disabled={!hasRedo}
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
        cursorLocation: state.cursorLocation,
        hasUndo: !!state.canvasState.past.length,
        hasRedo: !!state.canvasState.future.length,
    };
}

const mapDispatchToProps = {
    dispatchChangeImageDimensions,
    dispatchUndoImageEdit,
    dispatchRedoImageEdit
};


export const BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBarImpl);