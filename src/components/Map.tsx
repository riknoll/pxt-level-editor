import * as React from 'react';
import '../css/map.css';
import { ClientCoordinates, GestureTarget, bindGestureEvents, loadImageAsync, Bitmask } from '../util';
import { TILE_SIZE, TileSet } from '../tileset';
import { MapTools, pointerEvents, clientCoord } from '../util';
import { MapRect, MapData, MapObject, MapArea, overlaps, MapObjectLayers } from '../map';

export interface MapProps {
    tool: MapTools;
    map: MapData;
    activeLayer: MapObjectLayers;
    tileSet: TileSet
}

export class Map extends React.Component<MapProps, {}> {
    protected workspace: MapCanvas;

    constructor(props: MapProps) {
        super(props);
    }

    render() {
        return (
            <div className="map">
                <canvas ref={this.handleCanvasRef} />
                <div className="zoom">
                    <span ref="minus" className="fas fa-minus-square fa-lg" onClick={(event) => this.workspace.zoomIn(false)}></span>
                    <span ref="plus" className="fas fa-plus-square fa-lg" onClick={(event) => this.workspace.zoomIn(true)}></span>
                </div>
            </div>
        );
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    componentWillReceiveProps(props: MapProps) {
        this.workspace.setTileSet(props.tileSet);
    }

    componentDidUpdate() {
        this.workspace.updateTool(this.props.tool);
    }

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) this.workspace = new MapCanvas(ref, this.props.map, this.props.tileSet);
    };

    handleResize = () => {
        window.requestAnimationFrame(() => this.workspace.resize());
    }
}

export class MapCanvas implements GestureTarget {
    protected tool: MapTools;
    protected activeLayer: MapObjectLayers;

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

    protected bitmask: Bitmask;

    constructor(protected canvas: HTMLCanvasElement, protected map: MapData, protected tileSet: TileSet) {
        this.context = canvas.getContext("2d");

        this.resize();
        bindGestureEvents(canvas, this);
        canvas.addEventListener(pointerEvents.move, this.onMouseMove.bind(this));
        canvas.addEventListener(pointerEvents.leave, this.onMouseLeave.bind(this));

        this.map.addChangeListener(() => this.redraw());
        this.map.addObjectToLayer(MapObjectLayers.Decoration, new MapObject(1, 1));

    }

    setTileSet(tiles: TileSet){
        this.tileSet=tiles;
    }

    centerOnTile(x: number, y: number) {
        this.offsetX = -(this.mapToCanvas(x) - this.canvas.width / 2 + this.mapToCanvas(0.5));
        this.offsetY = -(this.mapToCanvas(y) - this.canvas.height / 2 + this.mapToCanvas(0.5));

        this.redraw();
    }

    redraw() {
        window.requestAnimationFrame(() => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const bounds = this.visibleRect();

            for (let c = bounds.left; c <= bounds.right; c++) {
                for (let r = bounds.top; r <= bounds.bottom; r++) {
                    const left = this.offsetX + this.mapToCanvas(c);
                    const top = this.offsetY + this.mapToCanvas(r);

                    // If there's a bitmask available for this tile, use it instead of the tilemap value
                    if (this.bitmask && this.bitmask.get(c - this.canvasToMap(-this.offsetX), r - this.canvasToMap(-this.offsetY)) === 1) {
                        switch (this.tool) {
                            case MapTools.Stamp:
                                this.drawTile(left, top, 1);
                                break;
                            case MapTools.Erase:
                                this.drawTile(left, top, null);
                                break;
                        }
                    } else {
                        this.drawTile(left, top, this.map.getTile(c, r));
                    }

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
        switch (this.tool) {
            case MapTools.Pan:
                this.canvas.style.cursor = this.isDragging ? "grabbing" : "grab";
                break;
            case MapTools.Stamp:
            case MapTools.Erase:
                this.canvas.style.cursor = "crosshair";
                break;
            default:
                this.canvas.style.cursor = "default";
        }
    }

    updateActiveLayer(layer: MapObjectLayers) {
        this.activeLayer = layer;
    }

    onClick(coord: ClientCoordinates) {
        const canvasCoords = this.clientToCanvas(coord);

        switch (this.tool) {
            case MapTools.Stamp:
                this.map.setTile(this.canvasToMap(canvasCoords.clientX - this.offsetX), this.canvasToMap(canvasCoords.clientY - this.offsetY), 1);
                break;
            case MapTools.Erase:
                this.map.setTile(this.canvasToMap(canvasCoords.clientX - this.offsetX), this.canvasToMap(canvasCoords.clientY - this.offsetY), null);
                break;
        }
    }

    onDragStart(coord: ClientCoordinates) {
        this.isDragging = true;
        this.updateTool();
        this.dragLast = coord;
    }

    onDragMove(coord: ClientCoordinates) {
        const canvasCoords = this.clientToCanvas(coord);
        const bounds = this.visibleRect();
        if (this.tool === MapTools.Pan) {
            this.offsetX += coord.clientX - this.dragLast.clientX;
            this.offsetY += coord.clientY - this.dragLast.clientY;
            this.dragLast = coord;
        } else {
            this.bitmask == null && (this.bitmask = new Bitmask(bounds.width, bounds.height));
            switch (this.tool) {
                case MapTools.Stamp:
                case MapTools.Erase:
                    this.bitmask.set(this.canvasToMap(canvasCoords.clientX - this.offsetX) + this.canvasToFullMap(this.offsetX), this.canvasToMap(canvasCoords.clientY - this.offsetY) + this.canvasToFullMap(this.offsetY));
                    break;
            }
        }
        this.redraw();
    }

    onDragEnd(coord: ClientCoordinates) {
        this.isDragging = false;
        this.updateTool();
        this.onDragMove(coord);
        const bounds = this.visibleRect();

        // Applies the bitmask based on the current tool
        if (this.bitmask) {
            for (let c = 0; c <= this.bitmask.width; c++) {
                for (let r = 0; r <= this.bitmask.height; r ++) {
                    if (this.bitmask.get(c, r) === 1) {
                        switch (this.tool) {
                            case MapTools.Stamp:
                                this.map.setTile(c + this.canvasToMap(-this.offsetX), r + this.canvasToMap(-this.offsetY), 1);
                                break;
                            case MapTools.Erase:
                                this.map.setTile(c + this.canvasToMap(-this.offsetX), r + this.canvasToMap(-this.offsetY), null);
                                break;
                        }
                    }
                }
            }
            this.bitmask = null;
        }

        this.dragLast = undefined;
    }

    onMouseEnter(evt: PointerEvent) {
        this.onMouseMove(evt);

        this.redraw();
    }

    onMouseMove(evt: PointerEvent) {
        const coord = clientCoord(evt);
        const canvasCoords = this.clientToCanvas(coord);
        
        this.mouseX = this.canvasToMap(canvasCoords.clientX - this.offsetX);
        this.mouseY = this.canvasToMap(canvasCoords.clientY - this.offsetY);
        
        this.redraw();
    }

    onMouseLeave(evt: PointerEvent) {
        this.mouseX = null;
        this.mouseY = null;

        this.redraw();
    }

    zoomIn(isZoomIn: boolean){

        let currentZoomAmount = isZoomIn ? this.amountToZoom : -1 * this.amountToZoom;
        this.zoomMultiplier += currentZoomAmount;

        if (isZoomIn) {
            this.zoomMultiplier = Math.min(this.maxMultiplier, this.zoomMultiplier);
        } else {
            this.zoomMultiplier = Math.max(this.minMultiplier, this.zoomMultiplier);
        }

        this.redraw();
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

    protected visibleRect(): MapRect {
        return {
            left: this.canvasToMap(-this.offsetX) - 1,
            top: this.canvasToMap(-this.offsetY) - 1,
            right: this.canvasToMap(-this.offsetX + this.cachedBounds.width) + 1,
            bottom: this.canvasToMap(-this.offsetY + this.cachedBounds.height) + 1,
            width: this.canvasToFullMap(this.cachedBounds.width) + 1,
            height: this.canvasToFullMap(this.cachedBounds.height) + 1
        }
    }

    protected drawObjectLayers(bounds: MapRect) {
        for (const layer of this.map.getLayers()) {
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
}
