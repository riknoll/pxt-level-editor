import { MapObjectLayers, MapObject, MapArea, MapObjectLayer, MapRect, SetMultiTileOp, MapOperation } from "./map"
import { Bitmask, MapTools } from "./util";
import { TileSet } from "./tileset";


export interface EditorLocation {
    column: number;
    row: number;
    canvasX?: number;
    canvasY?: number;
}

export interface EditorToolHost {
    getObjectAtLocation(location: EditorLocation, layer: MapObjectLayers): MapObject;
    getAreaAtLocation(location: EditorLocation): MapArea;
    getTile(location: EditorLocation): number;
    activeLayer(): MapObjectLayers;
    setCursor(cursor: string): void;
    clearCursor(): void;
    visibleBounds(): MapRect;
    getSelectedTiles(): MapRect;
    getTileSet(): TileSet;
    pan(dx: number, dy: number): void;

    stageAction(action: MapOperation): void;
    commitAction(action: MapOperation): void;
}

export interface EditorTool {
    onClick(location: EditorLocation): void;
    onDragStart(location: EditorLocation): void;
    onDragMove(location: EditorLocation): void;
    onDragEnd(location: EditorLocation): void;
    getCursor?: () => string;
}

export class BaseTool implements EditorTool {
    protected isDragging: boolean;

    constructor(protected host: EditorToolHost) {

    }

    onClick(location: EditorLocation) {

    }

    onDragStart(location: EditorLocation) {
        this.isDragging = true;
    }

    onDragMove(location: EditorLocation) {

    }

    onDragEnd(location: EditorLocation) {
        this.isDragging = false;
    }
}

export class StampTool extends BaseTool {
    protected action: SetMultiTileOp;

    onClick(location: EditorLocation) {
        this.host.commitAction({
            kind: "settile",
            row: location.row,
            col: location.column,
            selectedTiles: this.host.getSelectedTiles(),
            tileSet: this.host.getTileSet(),
            data: this.getColor()
        });
    }

    onDragStart(location: EditorLocation) {
        super.onDragStart(location);

        const editArea = this.host.visibleBounds();

        this.action = {
            kind: "multitile",
            bitmask: new Bitmask(editArea.width, editArea.height),
            offsetX: editArea.left,
            offsetY: editArea.top,
            data: this.getColor()
        };

        this.setTile(location.column, location.row);
    }

    onDragMove(location: EditorLocation) {
        if (!this.action) this.onDragStart(location);

        this.setTile(location.column, location.row);
    }

    onDragEnd(location: EditorLocation) {
        super.onDragEnd(location);
        this.setTile(location.column, location.row);

        this.host.commitAction(this.action);
    }

    getCursor() {
        return "crosshair";
    }

    protected setTile(col: number, row: number) {
        this.action.bitmask.set(col - this.action.offsetX, row - this.action.offsetY);
        this.host.stageAction(this.action);
    }

    protected getColor(): number {
        return 1;
    }
}

export class EraseTool extends StampTool {
    protected getColor(): number {
        return 0;
    }
}

export class PanTool extends BaseTool {
    protected dragLast: EditorLocation;

    onDragStart(location: EditorLocation) {
        super.onDragStart(location);

        this.dragLast = location;
        this.host.setCursor("grabbing");
    }

    onDragMove(location: EditorLocation) {
        this.host.pan(
            location.canvasX - this.dragLast.canvasX,
            location.canvasY - this.dragLast.canvasY
        );

        this.dragLast = location;
    }

    onDragEnd(location: EditorLocation) {
        super.onDragEnd(location);
        this.onDragMove(location);
        this.dragLast = undefined;
        this.host.clearCursor();
    }

    getCursor() {
        return this.isDragging ? "grabbing" : "grab";
    }
}