import * as React from "react";
import './css/bottomBar.css'

import { connect } from 'react-redux';
import { ImageEditorStore } from './store/imageReducer';
import { dispatchChangeImageDimensions, dispatchUndoImageEdit, dispatchRedoImageEdit, dispatchToggleAspectRatioLocked } from './actions/dispatch';
import { IconButton } from "./Button";

export interface BottomBarProps {
    dispatchChangeImageDimensions: (dimensions: [number, number]) => void;
    imageDimensions: [number, number];
    cursorLocation: [number, number];

    hasUndo: boolean;
    hasRedo: boolean;

    aspectRatioLocked: boolean;

    dispatchUndoImageEdit: () => void;
    dispatchRedoImageEdit: () => void;
    dispatchToggleAspectRatioLocked: () => void;
}

export interface BottomBarState {
    width?: number;
    height?: number;
}

export class BottomBarImpl extends React.Component<BottomBarProps, BottomBarState> {
    constructor(props: BottomBarProps) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            imageDimensions,
            cursorLocation,
            hasUndo,
            hasRedo,
            dispatchUndoImageEdit,
            dispatchRedoImageEdit,
            aspectRatioLocked,
            dispatchToggleAspectRatioLocked
        } = this.props;

        const width = this.state.width == null ? imageDimensions[0] : this.state.width;
        const height = this.state.height == null ? imageDimensions[1] : this.state.height;

        return (
            <div className="image-editor-bottombar">
                <div className="image-editor-resize">
                    <input className="image-editor-input"
                        title="Image Width"
                        value={width}
                        onChange={this.handleWidthChange}
                        onBlur={this.handleDimensionalBlur}
                    />

                    <IconButton
                        onClick={dispatchToggleAspectRatioLocked}
                        iconClass={aspectRatioLocked ? "fas fa-lock" : "fas fa-unlock"}
                        title={aspectRatioLocked ? "Unlock Apect Ratio" : "Lock Aspect Ratio"}
                        toggle={!aspectRatioLocked}
                    />

                    <input className="image-editor-input"
                        title="Image Height"
                        value={height}
                        onChange={this.handleHeightChange}
                        onBlur={this.handleDimensionalBlur}
                    />
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

    protected handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);

        if (!isNaN(value)) {
            const { aspectRatioLocked, imageDimensions } = this.props;
            if (aspectRatioLocked) {
                this.setState({
                    width: value,
                    height: Math.floor(value * (imageDimensions[1] / imageDimensions[0]))
                })
            }
            else {
                this.setState({ width: value });
            }
        }
    }

    protected handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);

        if (!isNaN(value)) {
            const { aspectRatioLocked, imageDimensions } = this.props;
            if (aspectRatioLocked) {
                this.setState({
                    width: Math.floor(value * (imageDimensions[0] / imageDimensions[1])),
                    height: value
                })
            }
            else {
                this.setState({ height: value });
            }
        }
    }

    protected handleDimensionalBlur = () => {
        const { imageDimensions, dispatchChangeImageDimensions } = this.props;
        const width = this.state.width == null ? imageDimensions[0] : Math.min(Math.max(this.state.width, 1), 999);
        const height = this.state.height == null ? imageDimensions[1] : Math.min(Math.max(this.state.height, 1), 999);

        if (width !== imageDimensions[0] || height !== imageDimensions[1]) {
            dispatchChangeImageDimensions([width, height]);
        }

        this.setState({
            width: null,
            height: null
        });
    }
}

function mapStateToProps(state: ImageEditorStore) {
    if (!state) return {};

    const bitmap = state.canvasState.present.bitmap;

    return {
        imageDimensions: [ bitmap.width, bitmap.height ],
        aspectRatioLocked: state.aspectRatioLocked,
        cursorLocation: state.cursorLocation,
        hasUndo: !!state.canvasState.past.length,
        hasRedo: !!state.canvasState.future.length,
    };
}

const mapDispatchToProps = {
    dispatchChangeImageDimensions,
    dispatchUndoImageEdit,
    dispatchRedoImageEdit,
    dispatchToggleAspectRatioLocked
};


export const BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBarImpl);