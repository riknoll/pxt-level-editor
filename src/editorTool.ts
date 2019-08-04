import { MapObjectLayers, MapObject, MapArea, MapObjectLayer, MapRect, SetMultiTileOp, MapOperation } from "./map"
import { Bitmask, MapTools } from "./util";
import { Project } from "./project";


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
    getSelectedTiles(): number[][];
    getProject(): Project;
    pan(dx: number, dy: number): void;
    showPropertyEditor: (show: boolean, obj?: MapObject) => void;

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
            selectedTiles: this.getSelectedTiles()
        });
    }

    onDragStart(location: EditorLocation) {
        super.onDragStart(location);

        const editArea = this.host.visibleBounds();

        this.action = {
            kind: "multitile",
            bitmask: new Bitmask(editArea.width, editArea.height),
            col: editArea.left,
            row: editArea.top,
            selectedTiles: this.getSelectedTiles()
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
        this.action.bitmask.set(col - this.action.col, row - this.action.row);
        this.host.stageAction(this.action);
    }

    protected getSelectedTiles(): number[][] {
        return this.host.getSelectedTiles();
    }
}

export class EraseTool extends StampTool {
    protected getSelectedTiles(): number[][] {
        return null;
    }
}

export class ObjectTool extends BaseTool {
    onClick(location: EditorLocation) {
        let object = this.host.getObjectAtLocation(location, this.host.activeLayer());
        this.host.showPropertyEditor(true, object);
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