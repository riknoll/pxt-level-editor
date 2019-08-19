import * as React from 'react';
import { connect } from 'react-redux';

import { ImageEditorStore, ImageEditorTool } from './store/imageReducer';
import { dispatchImageEdit } from "./actions/dispatch";
import { ImageState, Bitmap } from './store/bitmap';
import { GestureTarget, ClientCoordinates, bindGestureEvents } from '../../util';

import './css/imageCanvas';
import { Edit, EditState, getEdit, getEditState } from './toolDefinitions';

export interface ImageCanvasProps {
    dispatchImageEdit: (state: ImageState) => void;
    selectedColor: number;
    tool: ImageEditorTool;
    toolWidth: number;

    colors: string[];
    imageState?: ImageState;
}

class ImageCanvasImpl extends React.Component<ImageCanvasProps, {}> implements GestureTarget {
    protected canvas: HTMLCanvasElement;
    protected edit: Edit;
    protected editState: EditState;
    protected cursorLocation: [number, number];

    render() {
        return <div className="image-editor-canvas">
            <div className="image-editor-canvas-spacer" />
            <div className="image-editor-canvas-inner">
                <div className="image-editor-canvas-spacer" />
                <canvas ref="paint-surface" className="paint-surface checkerboard" />
                <div className="image-editor-canvas-spacer" />
            </div>
            <div className="image-editor-canvas-spacer" />
        </div>
    }

    componentDidMount() {
        this.canvas = this.refs["paint-surface"] as HTMLCanvasElement;
        bindGestureEvents(this.canvas, this);

        this.redraw();
        this.updateBackground();
    }

    componentDidUpdate() {
        this.redraw();

        this.updateBackground();
    }

    onClick(coord: ClientCoordinates): void {
        this.updateCursorLocation(coord);

        this.startEdit();
        this.updateEdit(this.cursorLocation[0], this.cursorLocation[1]);
        this.commitEdit();
    }

    onDragStart(coord: ClientCoordinates): void {
        this.updateCursorLocation(coord);
        this.startEdit();
    }

    onDragMove(coord: ClientCoordinates): void {
        if (this.updateCursorLocation(coord))
            this.updateEdit(this.cursorLocation[0], this.cursorLocation[1]);
    }

    onDragEnd(coord: ClientCoordinates): void {
        if (this.updateCursorLocation(coord))
            this.updateEdit(this.cursorLocation[0], this.cursorLocation[1]);
        this.commitEdit();
    }

    protected updateCursorLocation(coord: ClientCoordinates): boolean {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(((coord.clientX - rect.left) / rect.width) * this.canvas.width);
            const y = Math.floor(((coord.clientY - rect.top) / rect.height) * this.canvas.height);

            if (!this.cursorLocation || x !== this.cursorLocation[0] || y !== this.cursorLocation[1]) {
                this.cursorLocation = [x, y];
                return true;
            }

            return false;
        }

        this.cursorLocation = [0, 0];
        return false;
    }

    protected startEdit() {
        const { tool, toolWidth, selectedColor, imageState } = this.props;

        this.editState = getEditState(imageState);
        this.edit = getEdit(tool, this.editState, selectedColor, toolWidth);
        this.edit.start(this.cursorLocation[0], this.cursorLocation[1], this.editState);
    }

    protected updateEdit(x: number, y: number) {
        if (this.edit) {
            this.edit.update(x, y);

            this.redraw();
        }
    }

    protected commitEdit() {
        const { dispatchImageEdit } = this.props;

        if (this.edit) {
            this.edit.doEdit(this.editState);

            dispatchImageEdit({
                bitmap: this.editState.image.data(),
                layerOffsetX: this.editState.layerOffsetX,
                layerOffsetY: this.editState.layerOffsetY,
                floatingLayer: this.editState.floatingLayer && this.editState.floatingLayer.data()
            });

            this.edit = undefined;
            this.editState = undefined;
        }
    }

    protected redraw() {
        const { imageState } = this.props;

        if (imageState && this.canvas) {
            this.canvas.width = imageState.bitmap.width;
            this.canvas.height = imageState.bitmap.height;

            if (this.edit) {
                const clone = this.editState.copy();
                this.edit.doEdit(clone);
                this.drawBitmap(clone.image);
            }
            else {
                this.drawBitmap(Bitmap.fromData(imageState.bitmap));
            }
        }
    }

    protected drawBitmap(bitmap: Bitmap, x0 = 0, y0 = 0) {
        const { colors } = this.props;

        const context = this.canvas.getContext("2d");
        for (let x = x0; x < this.canvas.width; x++) {
            for (let y = y0; y < this.canvas.height; y++) {
                const index = bitmap.get(x, y);

                if (index) {
                    context.fillStyle = colors[index];
                    context.fillRect(x, y, 1, 1);
                }
                else {
                    context.clearRect(x, y, 1, 1);
                }
            }
        }
    }

    protected updateBackground() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.setAttribute("style", `--unit:${rect.width / this.canvas.width}px`);
    }
}


function mapStateToProps(state: ImageEditorStore) {
    if (!state) return {};
    return {
        selectedColor: state.selectedColor,
        colors: state.colors,
        imageState: state.canvasState.present,
        tool: state.tool,
        toolWidth: state.cursorSize
    };
}

const mapDispatchToProps = {
    dispatchImageEdit
};

export const ImageCanvas = connect(mapStateToProps, mapDispatchToProps)(ImageCanvasImpl);