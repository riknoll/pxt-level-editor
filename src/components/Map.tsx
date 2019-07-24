import * as React from 'react';
import { ClientCoordinates, GestureTarget, bindGestureEvents, loadImageAsync, Bitmask } from '../util';
import { TILE_SIZE, TileSet } from '../tileset';
import { MapRect, MapData, MapObject, MapArea, overlaps, MapObjectLayers, MapLog, ReadonlyMapData, MapOperation, SetTileOp, SetMultiTileOp } from '../map';
import { MapTools, pointerEvents, clientCoord } from '../util';
import { Tile } from './Toolbox/toolboxTypes';
import { EditorToolHost, EditorLocation, EditorTool, StampTool, PanTool, EraseTool } from '../editorTool';

import '../css/map.css';
import { OperationLog } from '../opLog';

export interface MapProps {
    tileSelected: Tile;
    selectedTiles: MapRect;
    tool: MapTools;
    map: MapLog;
    activeLayer: MapObjectLayers;
    tileSet: TileSet;
    onRectChange: (rect: MapRect) => void;
}

export interface MapState {
    canvasCoordinates: {
        mouseX: number,
        mouseY: number
    };
}

export class Map extends React.Component<MapProps, MapState> {
    protected workspace: MapCanvas;

    constructor(props: MapProps) {
        super(props);
        this.state = {
            canvasCoordinates: null
        }
        addEventListener(pointerEvents.move, this.handleCoordinates.bind(this));
    }

    render() {
        return (
            <div className="map">
                <canvas ref={this.handleCanvasRef} />
                { (this.state.canvasCoordinates) && <div className="coordinate">{this.state.canvasCoordinates.mouseX}, {this.state.canvasCoordinates.mouseY}</div> }
                <div className="zoom">
                    <span ref="minus" className="fas fa-minus-square fa-lg" onClick={(event) => this.workspace.zoomIn(false)}></span>
                    <span ref="plus" className="fas fa-plus-square fa-lg" onClick={(event) => this.workspace.zoomIn(true)}></span>
                </div>
            </div>
        );
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("keyup", this.handleKeyup);

        this.workspace.setOnRectChange(this.props.onRectChange);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    componentWillReceiveProps(props: MapProps) {
        this.workspace.setTileSet(props.tileSet);
    }

    componentDidUpdate() {
        this.workspace.updateTool(this.props.tool);
        this.workspace.setSelectedTiles(this.props.selectedTiles);
    }

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) this.workspace = new MapCanvas(
            ref, this.props.map, this.props.tileSet, this.props.selectedTiles);
    };

    handleResize = () => {
        window.requestAnimationFrame(() => this.workspace.resize());
    }

    handleCoordinates() {
        if (this.workspace) {
            this.setState({
                canvasCoordinates: this.workspace.getCanvasCoordinates()
            });
        }
    }

    handleKeyup = (e: KeyboardEvent) => {
        // TODO: add visual undo/redo buttons
        if (e.code == "KeyZ" && (e.ctrlKey || e.metaKey)) {
            this.workspace.undo()
        } else if (e.code == "KeyR" && e.ctrlKey) {
            this.workspace.redo()
        }
    }
}

export class MapCanvas implements GestureTarget, EditorToolHost {
    protected tool: MapTools;
    protected tools: EditorTool[];
    protected editorTool: EditorTool;
    protected layer: MapObjectLayers;

    protected zoomMultiplier = 10;
    protected minMultiplier = 1;
    protected maxMultiplier = 70;
    protected amountToZoom = 3;

    protected offsetX = 0;
    protected offsetY = 0;
    protected mouseX: number = null;
    protected mouseY: number = null;

    protected context: CanvasRenderingContext2D;
    protected cachedBounds: ClientRect;
    protected isDragging: boolean = false;
    protected dragLast: ClientCoordinates;
    protected stagedOp: MapOperation;

    protected onRectChange: (rect: MapRect) => void;

    constructor(
            protected canvas: HTMLCanvasElement,
            protected log: MapLog,
            protected tileSet: TileSet,
            protected selectedTiles: MapRect,
    ) {
        this.context = canvas.getContext("2d");
        this.log.addChangeListener(() => this.redraw())
        this.tools = [];

        this.resize();
        bindGestureEvents(canvas, this);
        canvas.addEventListener(pointerEvents.move, this.onMouseMove.bind(this));
        canvas.addEventListener(pointerEvents.leave, this.onMouseLeave.bind(this));
    }

    map(): ReadonlyMapData {
        return this.log.currentState()
    }

    setTileSet(tiles: TileSet) {
        // TODO(dz): handle undo/redo?
        this.tileSet = tiles;
    }

    setSelectedTiles(tiles: MapRect) {
        this.selectedTiles = tiles;
    }

    setOnRectChange(cb: (rect: MapRect) => void) {
        this.onRectChange = cb;
    }

    centerOnTile(x: number, y: number) {
        this.offsetX = -(this.mapToCanvas(x) - this.canvas.width / 2 + this.mapToCanvas(0.5));
        this.offsetY = -(this.mapToCanvas(y) - this.canvas.height / 2 + this.mapToCanvas(0.5));

        this.redraw();
    }

    redraw() {
        window.requestAnimationFrame(() => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const drawState = this.stagedOp ? MapCanvas.applyOperation(this.map().clone(), this.stagedOp) : this.map();
            const bounds = this.visibleRect();

            for (let c = bounds.left; c <= bounds.right; c++) {
                for (let r = bounds.top; r <= bounds.bottom; r++) {
                    const left = this.offsetX + this.mapToCanvas(c);
                    const top = this.offsetY + this.mapToCanvas(r);

                    this.drawTile(left, top, drawState.getTile(c, r));

                    if (this.mouseX === c && this.mouseY === r) {
                        this.context.fillStyle = "#5a5a5a"
                        this.context.globalAlpha = 0.5;
                        this.context.fillRect(left, top, TILE_SIZE * this.zoomMultiplier, TILE_SIZE * this.zoomMultiplier);
                        this.context.globalAlpha = 1;
                    }
                }
            }

            this.drawObjectLayers(bounds);
            this.drawGridlines(bounds, "#dedede", 1, (pos: number) => true); // Draws light grey gridlines every tile
            this.drawGridlines(bounds, "#9e9e9e", 2, (pos: number) => pos % 5 === 0); // Draws dark grey gridlines every 5 tiles
            this.drawGridlines(bounds, "#000", 3, (pos: number) => pos === 0); // Draws black gridlines at the origin
        })
    }

    resize() {
        try {
            this.cachedBounds = this.canvas.parentElement.getBoundingClientRect();

            this.canvas.width = this.canvas.parentElement.clientWidth;
            this.canvas.height = this.canvas.parentElement.clientHeight;

            this.redraw();
        }
        catch (e) {
            console.error("Could not update bounds", e);
        }
    }

    updateTool(tool?: MapTools) {
        // Developer's note: On Chrome, cursors do not update properly with the devtools open. Close the devtools when testing changes to this code
        if (tool != null)
            this.tool = tool;

        if (!this.tools[tool]) {
            switch (this.tool) {
                case MapTools.Pan:
                    this.tools[tool] = new PanTool(this);
                    break;
                case MapTools.Stamp:
                    this.tools[tool] = new StampTool(this);
                    break;
                case MapTools.Erase:
                    this.tools[tool] = new EraseTool(this);
                    break;
            }
        }
        this.editorTool = this.tools[tool];
        this.clearCursor();
    }

    private triggerOperation(op: MapOperation) {
        this.log.do(op)
    }

    static applyOperation(state: MapData, op: MapOperation): MapData {
        if (op.kind === "settile") {
            for (let row = 0; row < op.selectedTiles.height; row++) {
                for (let col = 0; col < op.selectedTiles.width; col++) {
                    state.setTile(
                        op.col + col,
                        op.row + row,
                        op.tileSet.coordToIndex(
                            op.selectedTiles.top + row,
                            op.selectedTiles.left + col,
                        )
                    );
                }
            }
        } else if (op.kind === "setobj") {
            state.addObjectToLayer(op.layer, op.obj)
        } else if (op.kind === "multitile") {
            for (let c = 0; c < op.bitmask.width; c++) {
                for (let r = 0; r < op.bitmask.height; r++) {
                    if (op.bitmask.get(c, r) === 1) {
                        state.setTile(c + op.offsetX, r + op.offsetY, op.data);
                    }
                }
            }
        } else {
            let _: never = op
        }
        return state
    }

    undo() {
        this.log.undo()
    }

    redo() {
        this.log.redo()
    }

    updateActiveLayer(layer: MapObjectLayers) {
        this.layer = layer;
    }

    onClick(coord: ClientCoordinates) {
        const canvasCoords = this.clientToCanvas(coord);
        let data = null
        let mapUpdate = false
        switch (this.tool) {
            case MapTools.Stamp:
                data = this.selectedTiles;
                mapUpdate = true
                break;
            case MapTools.Erase:
                data = null
                mapUpdate = true
                break;
        }

        if (mapUpdate) {
            let op: SetTileOp = {
                kind: "settile",
                row: this.canvasToMap(canvasCoords.clientY - this.offsetY),
                col: this.canvasToMap(canvasCoords.clientX - this.offsetX),
                tileSet: this.tileSet,
                selectedTiles: data,
            }
            console.log(op);
            this.triggerOperation(op)
        }

        if (this.editorTool) this.editorTool.onClick(this.clientToEditorLocation(coord));
    }

    onDragStart(coord: ClientCoordinates) {
        if (this.editorTool) this.editorTool.onDragStart(this.clientToEditorLocation(coord));
    }

    onDragMove(coord: ClientCoordinates) {
        if (this.editorTool) this.editorTool.onDragMove(this.clientToEditorLocation(coord));
    }

    onDragEnd(coord: ClientCoordinates) {
        if (this.editorTool) this.editorTool.onDragEnd(this.clientToEditorLocation(coord));
    }

    onMouseEnter(evt: PointerEvent) {
        this.onMouseMove(evt);

        this.redraw();
    }

    onMouseMove(evt: PointerEvent) {
        const coord = clientCoord(evt);
        const canvasCoords = this.clientToCanvas(coord);
        const c = this.canvasToMap(canvasCoords.clientX - this.offsetX);
        const r = this.canvasToMap(canvasCoords.clientY - this.offsetY);

        if (c !== this.mouseX || r !== this.mouseY) {
            this.mouseX = c;
            this.mouseY = r;
            this.redraw();
        }
    }

    onMouseLeave(evt: PointerEvent) {
        this.mouseX = null;
        this.mouseY = null;

        this.redraw();
    }

    getCanvasCoordinates() {
        if (this.mouseX == null && this.mouseY == null) return null;
        return {
            mouseX: this.mouseX,
            mouseY: this.mouseY
        };
    }

    zoomIn(isZoomIn: boolean) {
        let currentZoomAmount = isZoomIn ? this.amountToZoom : -1 * this.amountToZoom;
        this.zoomMultiplier += currentZoomAmount;

        if (isZoomIn) {
            this.zoomMultiplier = Math.min(this.maxMultiplier, this.zoomMultiplier);
        } else {
            this.zoomMultiplier = Math.max(this.minMultiplier, this.zoomMultiplier);
        }

        this.redraw();
    }

    getObjectAtLocation(location: EditorLocation, layer: MapObjectLayers): MapObject {
        return this.map().getLayer(layer).getObjectOnTile(location.column, location.row)
    }

    getAreaAtLocation(location: EditorLocation): MapArea {
        return this.map().getLayer(MapObjectLayers.Area).getObjectOnTile(location.column, location.row) as MapArea;
    }

    getTile(location: EditorLocation): number {
        return this.map().getTile(location.column, location.row);
    }

    setCursor(cursor: string): void {
        this.canvas.style.cursor = cursor;
    }

    clearCursor(): void {
        if (this.editorTool && this.editorTool.getCursor) {
            this.canvas.style.cursor = this.editorTool.getCursor();
        }
        else {
            this.canvas.style.cursor = "default";
        }
    }

    visibleBounds(): MapRect {
       return this.visibleRect();
    }

    pan(dx: number, dy: number) {
        this.offsetX += dx;
        this.offsetY += dy;
        this.redraw();
    }

    activeLayer(): MapObjectLayers {
        return this.layer;
    }

    stageAction(action: MapOperation): void {
        this.stagedOp = action;
    }

    commitAction(action: MapOperation): void {
        this.triggerOperation(action);
        this.stagedOp = undefined;
    }

    getSelectedTiles() {
        return this.selectedTiles;
    }

    getTileSet() {
        return this.tileSet;
    }

    protected drawTile(x: number, y: number, data: number) {
        if (this.tileSet && data != null) {
            this.context.imageSmoothingEnabled = false;
            const coord = this.tileSet.indexToCoord(data);
            this.context.drawImage(this.tileSet.src, coord.clientX, coord.clientY, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE * this.zoomMultiplier, TILE_SIZE * this.zoomMultiplier)
        }
        else {
            this.context.fillStyle = data ? "red" : "white";
            this.context.fillRect(x, y, TILE_SIZE * this.zoomMultiplier, TILE_SIZE * this.zoomMultiplier);
        }
    }

    visibleRect(): MapRect {
        let rect = {
            left: this.canvasToMap(-this.offsetX) - 1,
            top: this.canvasToMap(-this.offsetY) - 1,
            right: this.canvasToMap(-this.offsetX + this.cachedBounds.width) + 1,
            bottom: this.canvasToMap(-this.offsetY + this.cachedBounds.height) + 1,
            width: this.canvasToFullMap(this.cachedBounds.width) + 1,
            height: this.canvasToFullMap(this.cachedBounds.height) + 1
        }

        this.onRectChange(rect);
        return rect;
    }

    protected drawObjectLayers(bounds: MapRect) {
        for (const layer of this.map().getLayers()) {
            const objects = layer.getObjects().filter(o => overlaps(bounds, o));

            for (const obj of objects) {
                this.drawMapObject(obj)
            }
        }
    }

    protected drawMapArea(obj: MapArea) {
        const x = this.offsetX + this.mapToCanvas(obj.column)
        const y = this.offsetY + this.mapToCanvas(obj.row)
        const width = this.mapToCanvas(obj.width);
        const height = this.mapToCanvas(obj.height);

        this.context.fillStyle = obj.primaryColor;
        this.context.globalAlpha = 0.6;
        this.context.fillRect(x, y, width, height);

        this.context.globalAlpha = 1;
        this.context.strokeStyle = obj.outlineColor;
        this.context.strokeRect(x, y, width, height);
    }

    protected drawMapObject(obj: MapObject) {
        const x = this.offsetX + this.mapToCanvas(obj.column)
        const y = this.offsetY + this.mapToCanvas(obj.row)
        const width = this.mapToCanvas(obj.width);
        const height = this.mapToCanvas(obj.height);

        this.context.fillStyle = "#00a1f2";
        this.context.globalAlpha = 0.6;
        this.context.fillRect(x, y, width, height);

        this.context.globalAlpha = 1;
        this.context.strokeStyle = "#00a1f2";
        this.context.strokeRect(x, y, width, height);
    }

    protected drawGridlines(bounds: MapRect, color: string, width: number, condition: (pos: number) => boolean) {
        this.context.strokeStyle = color;
        this.context.lineWidth = width;
        this.context.beginPath();

        for (let c = bounds.left; c <= bounds.right; c++) {
            if (condition(c)) {
                this.context.moveTo(this.offsetX + this.mapToCanvas(c), 0)
                this.context.lineTo(this.offsetX + this.mapToCanvas(c), this.cachedBounds.height)
            }
        }

        for (let r = bounds.top; r <= bounds.bottom; r++) {
            if (condition(r)) {
                this.context.moveTo(0, this.offsetY + this.mapToCanvas(r))
                this.context.lineTo(this.cachedBounds.width, this.offsetY + this.mapToCanvas(r))
            }
        }

        this.context.stroke();
    }

    protected canvasToFullMap(val: number) {
        return Math.ceil(val / (TILE_SIZE * this.zoomMultiplier));
    }

    protected canvasToMap(val: number) {
        return Math.floor(val / (TILE_SIZE * this.zoomMultiplier));
    }

    protected mapToCanvas(val: number) {
        return val * TILE_SIZE * this.zoomMultiplier
    }

    protected clientToCanvas(coord: ClientCoordinates): ClientCoordinates {
        return {
            clientX: coord.clientX - this.cachedBounds.left,
            clientY: coord.clientY - this.cachedBounds.top
        };
    }

    protected clientToEditorLocation(coord: ClientCoordinates): EditorLocation {
        const canvasCoords = this.clientToCanvas(coord);

        return {
            column : this.canvasToMap(canvasCoords.clientX - this.offsetX),
            row: this.canvasToMap(canvasCoords.clientY - this.offsetY),
            canvasX: canvasCoords.clientX,
            canvasY: canvasCoords.clientY
        }
    }
}
