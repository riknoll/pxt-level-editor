import * as React from 'react';
import '../css/map.css';
import { ClientCoordinates, GestureTarget, bindGestureEvents, loadImageAsync } from '../util';
import { TILE_SIZE, TileSet } from '../tileset';
import { MapRect, MapData } from '../map';

export class Map extends React.Component<{}, {}> {
    protected workspace: MapCanvas;

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="map">
                <canvas ref={this.handleCanvasRef} />
            </div>
        );
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) this.workspace = new MapCanvas(ref);
    };

    handleResize = () => {
        window.requestAnimationFrame(() => this.workspace.resize());
    }
}

export class MapCanvas implements GestureTarget {
    protected map: MapData;

    protected zoomMultiplier = 10;
    protected offsetX = 0;
    protected offsetY = 0;

    protected context: CanvasRenderingContext2D;
    protected cachedBounds: ClientRect;
    protected dragLast: ClientCoordinates;

    protected tileset: TileSet;

    constructor(protected canvas: HTMLCanvasElement) {
        this.context = canvas.getContext("2d");
        this.map = new MapData();

        this.resize();
        bindGestureEvents(canvas, this);

        this.map.onChange(() => this.redraw());

        loadImageAsync("./tile.png")
            .then(el => {
                this.tileset = new TileSet(el);
                this.redraw();
            });
    }

    redraw() {
        window.requestAnimationFrame(() => {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const bounds = this.visibleRect();

            for (let c = bounds.left; c <= bounds.right; c++) {
                for (let r = bounds.top; r <= bounds.bottom; r++) {

                    const left = this.offsetX + this.mapToCanvas(c);
                    const top = this.offsetY + this.mapToCanvas(r);
                    this.drawTile(left, top, this.map.getTile(c, r));
                }
            }

            this.context.strokeStyle = "#dedede"
            this.context.beginPath();

            for (let c = bounds.left; c <= bounds.right; c++) {
                this.context.moveTo(this.offsetX + this.mapToCanvas(c), 0)
                this.context.lineTo(this.offsetX + this.mapToCanvas(c), this.cachedBounds.height)
            }

            for (let r = bounds.top; r <= bounds.bottom; r++) {
                this.context.moveTo(0, this.offsetY + this.mapToCanvas(r))
                this.context.lineTo(this.cachedBounds.width, this.offsetY + this.mapToCanvas(r))
            }

            this.context.stroke();
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

    onClick(coord: ClientCoordinates) {
        coord = this.clientToCanvas(coord);

        this.map.setTile(this.canvasToMap(coord.clientX - this.offsetX), this.canvasToMap(coord.clientY - this.offsetY), 1);
    }

    onDragStart(coord: ClientCoordinates) {
        this.dragLast = coord;
    }

    onDragMove(coord: ClientCoordinates) {
        this.offsetX += coord.clientX - this.dragLast.clientX;
        this.offsetY += coord.clientY - this.dragLast.clientY;
        this.dragLast = coord;

        this.redraw();
    }

    onDragEnd(coord: ClientCoordinates) {
        this.onDragMove(coord);
        this.dragLast = undefined;
    }

    protected drawTile(x: number, y: number, data: number) {

        if (this.tileset) {
            this.context.imageSmoothingEnabled = false;
            const coord = this.tileset.indexToCoord(data || 0);
            this.context.drawImage(this.tileset.src, coord.clientX, coord.clientY, TILE_SIZE, TILE_SIZE, x, y, TILE_SIZE * this.zoomMultiplier, TILE_SIZE * this.zoomMultiplier)
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
            bottom: this.canvasToMap(-this.offsetY + this.cachedBounds.height) + 1
        }
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