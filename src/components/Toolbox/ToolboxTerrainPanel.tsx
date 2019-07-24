import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';
import { TileSet } from '../../tileset';
import { GestureTarget, ClientCoordinates, clientCoord, bindGestureEvents } from '../../util';
import { MapRect } from '../../map';

interface TerrainPanelProps {
    tileset: TileSet,
    onChange: (selection: MapRect) => void,
}

export class ToolboxTerrainPanel extends React.Component<TerrainPanelProps, {}> implements GestureTarget {
    protected ctx: CanvasRenderingContext2D;
    protected canvas: HTMLCanvasElement;
    protected selectedTile: number;
    protected scale: number;

    protected selectionStart: {row: number, col: number};
    protected selectedArea: MapRect;

    constructor(props: TerrainPanelProps) {
        super(props);

        this.selectedArea = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 1,
            height: 1,
        };
        this.props.onChange(this.selectedArea);

        this.scale = 2;
    }

    render() {
        return (
            <ToolboxPanel expandedByDefault={true} title="Terrain">
                {/* <ToolboxPanelGrid tiles={this.state.tiles} ></ToolboxPanelGrid> */}
                <canvas ref={this.handleCanvasRef}/>
            </ToolboxPanel>
        );
    }

    componentDidUpdate() {
        if (this.props.tileset && this.ctx) {
            this.redraw();
        }
    }

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) {
            this.canvas = ref;
            this.ctx = ref.getContext("2d");
            bindGestureEvents(this.canvas, this);
        }
    }

    redraw() {
        this.canvas.width = this.props.tileset.src.width * this.scale;
        this.canvas.height = this.props.tileset.src.height * this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let tileset = this.props.tileset.src;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(
            tileset, 0, 0, tileset.width, tileset.height, 0, 0,
            tileset.width * this.scale, tileset.height * this.scale
        );

        // Draw selection square
        let x = (this.selectedTile % this.props.tileset.columns)
            * this.props.tileset.tileSize * this.scale;
        let y = Math.floor(this.selectedTile / this.props.tileset.columns)
            * this.props.tileset.tileSize * this.scale;

        this.ctx.strokeStyle = "red"
        let tileSize = this.props.tileset.tileSize * this.scale
        this.ctx.strokeRect(
            this.selectedArea.left * tileSize,
            this.selectedArea.top * tileSize,
            this.selectedArea.width * tileSize,
            this.selectedArea.height * tileSize
        );
    }

    protected getTilePos(coord: ClientCoordinates) {
        // Convert local coordinates, to position (row, col) in the tileset
        return {
            row: Math.floor(
                coord.clientY / this.props.tileset.tileSize / this.scale),
            col: Math.floor(
                coord.clientX / this.props.tileset.tileSize / this.scale),
        }
    }

    onClick(coord: ClientCoordinates) {
        let tilePos = this.getTilePos(
            this.coordGlobalToLocal(coord, this.canvas));

        this.selectedArea = {
            top: tilePos.row,
            bottom: tilePos.row,
            left: tilePos.col,
            right: tilePos.col,
            width: 1,
            height: 1,
        };

        this.props.onChange(this.selectedArea);

        this.redraw();
    };


    onDragStart(coord: ClientCoordinates) {
        this.selectionStart = this.getTilePos(
            this.coordGlobalToLocal(coord, this.canvas));

        this.onDragMove(coord)
    };

    onDragMove(coord: ClientCoordinates) {
        let tilePos = this.getTilePos(
            this.coordGlobalToLocal(coord, this.canvas));

        this.selectedArea.right = Math.max(
            this.selectionStart.col, tilePos.col);
        this.selectedArea.bottom = Math.max(
            this.selectionStart.row, tilePos.row);
        this.selectedArea.left = Math.min(
            this.selectionStart.col, tilePos.col);
        this.selectedArea.top = Math.min(
            this.selectionStart.row, tilePos.row);
        this.selectedArea.width =
            this.selectedArea.right - this.selectedArea.left + 1;
        this.selectedArea.height =
            this.selectedArea.bottom - this.selectedArea.top + 1;

        this.props.onChange(this.selectedArea);

        this.redraw();
    };

    onDragEnd(coord: ClientCoordinates) {};

    protected coordGlobalToLocal(
            coord: ClientCoordinates, local: HTMLElement): ClientCoordinates {
        let rect = local.getBoundingClientRect()

        return {
            clientX: coord.clientX - rect.left,
            clientY: coord.clientY - rect.top,
        }
    }
}
