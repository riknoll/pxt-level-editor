import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';
import { GestureTarget, ClientCoordinates, clientCoord, bindGestureEvents } from '../../util';
import { MapRect } from '../../map';
import { Project, ProjectSprite, isSpriteSheetReference } from '../../project';

interface TerrainPanelProps {
    project: Project,
    onChange: (selection: number[][]) => void,
}

export class ToolboxTerrainPanel extends React.Component<TerrainPanelProps, {}> implements GestureTarget {
    protected canvas: HTMLCanvasElement;
    protected selectedTile: number;
    protected scale: number;

    protected selectionStart: {row: number, col: number};
    protected selectedArea: MapRect;
    protected columns = 7;
    protected rows: number;

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
        this.props.onChange(this.getTileSelection());

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
        if (this.props.project && this.canvas) {
            this.redraw();
        }
    }

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) {
            this.canvas = ref;
            bindGestureEvents(this.canvas, this);
        }
    }

    redraw() {
        const proj = this.props.project;
        this.rows = Math.ceil(proj.tiles.length / this.columns);

        this.canvas.width = proj.tileSize * this.scale * this.columns;
        this.canvas.height = proj.tileSize * this.scale * this.rows;
        const ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < proj.tiles.length; i++) {
            this.drawTile(proj.tiles[i], proj.tileSize, i);
        }

        ctx.strokeStyle = "red"
        let tileSize = this.props.project.tileSize * this.scale
        ctx.strokeRect(
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
                coord.clientY / this.props.project.tileSize / this.scale),
            col: Math.floor(
                coord.clientX / this.props.project.tileSize / this.scale),
        }
    }

    protected getTileSelection() {
        const selection: number[][] = [];

        for (let c = 0; c < this.selectedArea.width; c++) {
            selection.push([]);
            let index = this.selectedArea.top * this.columns + this.selectedArea.left + c;
            for (let r = 0; r < this.selectedArea.height; r++) {
                selection[c][r] = index;
                index += this.columns;
            }
        }

        return selection;
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

        this.props.onChange(this.getTileSelection());

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

        this.selectedArea.right = Math.min(
            Math.max(this.selectionStart.col, tilePos.col),
            this.columns - 1
        );
        this.selectedArea.bottom = Math.min(
            Math.max(this.selectionStart.row, tilePos.row),
            this.rows - 1
        );
        this.selectedArea.left = Math.max(
            Math.min(this.selectionStart.col, tilePos.col),
            0
        );
        this.selectedArea.top = Math.max(
            Math.min(this.selectionStart.row, tilePos.row),
            0
        );

        this.selectedArea.width =
            this.selectedArea.right - this.selectedArea.left + 1;
        this.selectedArea.height =
            this.selectedArea.bottom - this.selectedArea.top + 1;

        this.props.onChange(this.getTileSelection());

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

    protected drawTile(sprite: ProjectSprite, tileSize: number, index: number) {
        const ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const x = (index % this.columns) * tileSize * this.scale;
        const y = Math.floor(index / this.columns) * tileSize * this.scale;

        if (isSpriteSheetReference(sprite)) {
            ctx.drawImage(
                sprite.sheet.loaded,
                sprite.x,
                sprite.y,
                sprite.width,
                sprite.height,
                x,
                y,
                sprite.width * this.scale,
                sprite.height * this.scale
            );
        }
        else {
            ctx.drawImage(sprite.loaded, x, y);
        }
    }
}
