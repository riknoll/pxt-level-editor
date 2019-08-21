import * as React from 'react';
import { connect } from 'react-redux';

import { ImageEditorStore, ImageEditorTool } from './store/imageReducer';
import { dispatchImageEdit } from "./actions/dispatch";
import { ImageState, Bitmap } from './store/bitmap';
import { GestureTarget, ClientCoordinates, bindGestureEvents } from '../../util';

import './css/imageCanvas';
import { Edit, EditState, getEdit, getEditState, ToolCursor, tools } from './toolDefinitions';

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
    protected floatingLayer: HTMLDivElement;

    protected edit: Edit;
    protected editState: EditState;
    protected cursorLocation: [number, number];
    protected cursor: ToolCursor | string = ToolCursor.Crosshair;

    render() {
        const { imageState } = this.props;
        const isPortrait = !imageState || (imageState.bitmap.height > imageState.bitmap.width);

        return <div className={`image-editor-canvas ${isPortrait ? "portrait" : "landscape"}`}>
            <div className="image-editor-canvas-spacer" />
            <div className="image-editor-canvas-inner">
                <div className="image-editor-canvas-spacer" />
                <canvas ref="paint-surface" className="paint-surface checkerboard" />
                <div className="image-editor-canvas-spacer" />
            </div>
            <div className="image-editor-canvas-spacer" />
            <div ref="floating-layer-border" className="image-editor-floating-layer" />
        </div>
    }

    componentDidMount() {
        this.canvas = this.refs["paint-surface"] as HTMLCanvasElement;
        this.floatingLayer = this.refs["floating-layer-border"] as HTMLDivElement;
        bindGestureEvents(this.canvas, this);
        bindGestureEvents(this.floatingLayer, this);

        const { imageState } = this.props;
        this.editState = getEditState(imageState);

        this.redraw();
        this.updateBackground();
    }

    componentDidUpdate() {
        if (!this.edit || !this.editState) {
            const { imageState } = this.props;
            this.editState = getEditState(imageState);
        }
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

        this.edit.end(this.cursorLocation[0], this.cursorLocation[1], this.editState);
        this.commitEdit();
    }

    protected updateCursorLocation(coord: ClientCoordinates): boolean {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(((coord.clientX - rect.left) / rect.width) * this.canvas.width);
            const y = Math.floor(((coord.clientY - rect.top) / rect.height) * this.canvas.height);

            if (!this.cursorLocation || x !== this.cursorLocation[0] || y !== this.cursorLocation[1]) {
                this.cursorLocation = [x, y];

                this.udpateCursor(!!this.edit, this.editState.inFloatingLayer(x, y));
                return true;
            }

            return false;
        }

        this.cursorLocation = [0, 0];
        return false;
    }

    protected udpateCursor(isDown: boolean, inLayer: boolean) {
        const { tool } = this.props;
        const def = tools.filter(td => td.tool === tool)[0];

        if (!def) this.updateCursorCore(ToolCursor.Default)
        else if (inLayer) {
            if (isDown) {
                this.updateCursorCore(def.downLayerCursr || def.hoverLayerCursor || def.downCursor || def.hoverCursor);
            }
            else {
                this.updateCursorCore(def.hoverLayerCursor || def.hoverCursor);
            }
        }
        else if (isDown) {
            this.updateCursorCore(def.downCursor || def.hoverCursor);
        }
        else {
            this.updateCursorCore(def.hoverCursor);
        }
    }

    protected updateCursorCore(cursor: ToolCursor | string) {
        this.cursor = cursor || ToolCursor.Default;

        this.updateBackground();
    }

    protected startEdit() {
        const { tool, toolWidth, selectedColor } = this.props;

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
        const { dispatchImageEdit, imageState } = this.props;

        if (this.edit) {
            this.editState = getEditState(imageState);
            this.edit.doEdit(this.editState);

            dispatchImageEdit({
                bitmap: this.editState.image.data(),
                layerOffsetX: this.editState.layerOffsetX,
                layerOffsetY: this.editState.layerOffsetY,
                floatingLayer: this.editState.floatingLayer && this.editState.floatingLayer.data()
            });

            this.edit = undefined;
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
                this.redrawFloatingLayer(clone);
            }
            else {
                this.drawBitmap(this.editState.image);
                this.redrawFloatingLayer(this.editState);
            }
        }
    }

    protected redrawFloatingLayer(state: EditState) {
        if (state.floatingLayer) {
            this.drawBitmap(state.floatingLayer, state.layerOffsetX, state.layerOffsetY, true);

            const border = this.refs["floating-layer-border"] as HTMLDivElement;
            const rect = this.canvas.getBoundingClientRect();
            border.style.left = (rect.left - 2 + (rect.width / state.width) * state.layerOffsetX) + "px";
            border.style.top = (rect.top - 2 + (rect.height / state.height) * state.layerOffsetY) + "px";
            border.style.width = ((rect.width / state.width) * state.floatingLayer.width) + "px";
            border.style.height = ((rect.height / state.height) * state.floatingLayer.height) + "px";
        }
    }

    protected drawBitmap(bitmap: Bitmap, x0 = 0, y0 = 0, transparent = false) {
        const { colors } = this.props;

        const context = this.canvas.getContext("2d");
        for (let x = 0; x < bitmap.width; x++) {
            for (let y = 0; y < bitmap.height; y++) {
                const index = bitmap.get(x, y);

                if (index) {
                    context.fillStyle = colors[index];
                    context.fillRect(x + x0, y + y0, 1, 1);
                }
                else {
                    if (!transparent) context.clearRect(x + x0, y + y0, 1, 1);
                }
            }
        }
    }

    protected updateBackground() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.setAttribute("style", `--unit:${rect.width / this.canvas.width}px; cursor:${this.cursor}`);
        this.floatingLayer.style.cursor = this.cursor;
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