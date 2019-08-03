import * as React from 'react';
import SpriteSheet from './SpriteSheet';
import { Tile } from './toolboxTypes';
import { ToolboxPanel } from './ToolboxPanel';
import { ToolboxPanelGrid } from './ToolboxPanelGrid';
import { GestureTarget, ClientCoordinates, clientCoord, bindGestureEvents } from '../../util';
import { MapRect } from '../../map';
import { Project, ProjectSprite, isSpriteSheetReference, SpriteSheetReference } from '../../project';

interface TerrainPanelProps {
    project: Project,
    onChange: (selection: number[][]) => void,
}

interface TilesetReference {
    index: number;
    sprite: ProjectSprite;
}

export class ToolboxTerrainPanel extends React.Component<TerrainPanelProps, {}> implements GestureTarget {
    protected canvas: HTMLCanvasElement;
    protected selectedTile: number;
    protected scale: number;

    protected selectionStart: {row: number, col: number};
    protected selectedArea: MapRect;
    protected rows: number;
    protected grid: TilesetReference[][];

    get columns(): number {
        return this.grid ? this.grid.length : 0;
    }

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
            this.grid = layoutTiles(this.props.project.tiles);
            this.rows = 0;

            for (const column of this.grid) {
                if (column) this.rows = Math.max(column.length, this.rows);
            }

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
        if (!this.grid) return;

        const proj = this.props.project;

        this.canvas.width = proj.tileSize * this.scale * 7;
        this.canvas.height = proj.tileSize * this.scale * this.rows;

        const ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let c = 0; c < this.columns; c++) {
            for (let r = 0; r < this.rows; r++) {
                if (this.grid[c] && this.grid[c][r]) {
                    this.drawTile(this.grid[c][r].sprite, c * proj.tileSize * this.scale, r * proj.tileSize * this.scale);
                }
            }
        }

        ctx.strokeStyle = "#9e9e9e";
        ctx.setLineDash([1, 2]);

        for (let c = 1; c < 7; c++) {
            ctx.beginPath();
            ctx.moveTo(this.scale * proj.tileSize * c, 0);
            ctx.lineTo(this.scale * proj.tileSize * c, this.canvas.height);
            ctx.stroke();
        }
        for (let r = 0; r < this.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, this.scale * proj.tileSize * r);
            ctx.lineTo(this.canvas.width, this.scale * proj.tileSize * r);
            ctx.stroke();
        }


        // for (let i = 0; i < proj.tiles.length; i++) {
            //     this.drawTile(proj.tiles[i], proj.tileSize, i);
            // }

        ctx.setLineDash([]);
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

        if (this.grid) {
            for (let c = 0; c < this.selectedArea.width; c++) {
                selection.push([]);
                for (let r = 0; r < this.selectedArea.height; r++) {
                    const gc = c + this.selectedArea.left;
                    const gr = r + this.selectedArea.top;
                    selection[c][r] = (this.grid[gc] && this.grid[gc][gr]) ? this.grid[gc][gr].index : -1;
                }
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

    protected drawTile(sprite: ProjectSprite, x: number, y: number) {
        const ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

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


class TileGroup {
    tiles: TilesetReference[];

    columns: number;
    rows: number;
    originX: number;
    originY: number;

    constructor(public group: string, public tileSize: number) {
        this.tiles = [];
    }

    calculateDimensions() {
        if (!this.tiles.length) return;

        let minX = (this.tiles[0].sprite as SpriteSheetReference).x;
        let minY = (this.tiles[0].sprite as SpriteSheetReference).y;
        let maxX = (this.tiles[0].sprite as SpriteSheetReference).x;
        let maxY = (this.tiles[0].sprite as SpriteSheetReference).y;

        for (const sprite of this.tiles) {
            minX = Math.min((sprite.sprite as SpriteSheetReference).x, minX);
            minY = Math.min((sprite.sprite as SpriteSheetReference).y, minY);
            maxX = Math.max((sprite.sprite as SpriteSheetReference).x + this.tileSize, maxX);
            maxY = Math.max((sprite.sprite as SpriteSheetReference).y + this.tileSize, maxY);
        }

        this.originX = minX;
        this.originY = minY;
        this.columns = Math.ceil((maxX - minX) / this.tileSize);
        this.rows = Math.ceil((maxY - minY) / this.tileSize);
    }
}

function layoutTiles(refs: ProjectSprite[]): TilesetReference[][] {
    const groups: {[index: string]: TileGroup} = {};
    const unsorted: TilesetReference[] = [];

    for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        if (isSpriteSheetReference(ref) && ref.group) {
            if (!groups[ref.group]) groups[ref.group] = new TileGroup(ref.group, ref.width);

            groups[ref.group].tiles.push({ index: i, sprite: ref});
        }
        else {
            unsorted.push({ index: i, sprite: ref });
        }
    }

    const groupList = Object.keys(groups).map(k => groups[k]);
    groupList.forEach(g => g.calculateDimensions());

    const spriteGrid: TilesetReference[][] = [];
    let top = 0;

    for (const group of groupList) {
        for (const tile of group.tiles) {
            const col = ((tile.sprite as SpriteSheetReference).x - group.originX) / group.tileSize;
            const row = ((tile.sprite as SpriteSheetReference).y - group.originY) / group.tileSize;

            if (!spriteGrid[col]) spriteGrid[col] = [];

            spriteGrid[col][top + row] = tile;
        }

        top += group.rows;
    }

    for (let i = 0; i < unsorted.length; i++) {
        const col = i % spriteGrid.length;
        const row = Math.floor(i / spriteGrid.length);

        spriteGrid[col][top + row] = unsorted[i];
    }

    return spriteGrid;
}