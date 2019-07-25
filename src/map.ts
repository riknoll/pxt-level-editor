import { OperationLog } from "./opLog";
import { Bitmask } from "./util";
import { TileSet } from "./tileset";

export interface MapRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export class MapLocation {
    constructor(public column: number, public row: number) {
    }

    setLocation(column: number, row: number) {
        this.column = column;
        this.row = row;
    }
}

export class MapObject extends MapLocation implements MapRect {
    protected static nextID = 0;
    protected static getID() {
        return MapObject.nextID++;
    }

    public readonly id: number;
    public width = 1;
    public height = 1;

    constructor(column = 0, row = 0) {
        super(column, row);

        this.id = MapObject.getID();
    }

    get left() {
        return this.column;
    }

    get top() {
        return this.row;
    }

    get right() {
        return this.column + this.width - 1;
    }

    get bottom() {
        return this.row + this.height - 1;
    }

    clone() {
        const m = new MapObject(this.column, this.row);
        m.width = this.width;
        m.height = this.height;
        (m as any).id = this.id;
        return m;
    }
}

export class MapArea extends MapObject {
    primaryColor = "#00a1f2";
    outlineColor = "#00a1f2";

    constructor(public width = 1, public height = 1) {
        super(0, 0);
    }

    setColors(primary: string, outline: string) {
        this.primaryColor = primary;
        this.outlineColor = outline;
    }

    setDimensions(width: number, height: number) {
        if (width > 0) this.width = width | 0;
        if (height > 0) this.height = height | 0;
    }

    clone() {
        const base = super.clone() as unknown as MapArea;
        base.primaryColor = this.primaryColor;
        base.outlineColor = this.outlineColor;
        return base;
    }
}

export class MapQuadrant {
    protected data: number[][];

    constructor() {
        this.data = [];
    }

    setTile(col: number, row: number, data: number) {
        col = Math.abs(col);
        row = Math.abs(row);

        if (!this.data[col]) this.data[col] = [];
        this.data[col][row] = data;
    }

    getTile(col: number, row: number) {
        col = Math.abs(col);
        row = Math.abs(row);

        if (this.data[col]) {
            return this.data[col][row];
        }

        return undefined;
    }

    clone() {
        const m = new MapQuadrant();
        m.data = [];

        for (let col = 0; col < this.data.length; col++) {
            if (this.data[col]) {
                m.data[col] = this.data[col].slice();
            }
        }

        return m;
    }
}

// This could be made into a quadtree if performance is an issue
export class MapObjectLayer {
    protected objects: MapObject[];

    constructor() {
        this.objects = [];
    }

    addObject(object: MapObject) {
        this.objects.push(object);
    }

    removeObject(object: MapObject) {
        this.removeObjectById(object.id);
    }

    removeObjectById(id: number) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === id) {
                this.objects = this.objects.splice(i, 1);
                return;
            }
        }
    }

    getObjectById(id: number) {
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].id === id) {
                return this.objects[i];
            }
        }

        return undefined;
    }

    numObjects() {
        return this.objects.length;
    }

    getObjects(): ReadonlyArray<MapObject> {
        return this.objects;
    }

    getObjectOnTile(col: number, row: number) {
        const test: MapRect = {
            left: col,
            right: col,
            top: row,
            bottom: row,
            width: 1,
            height: 1
        };

        for (const obj of this.objects) {
            if (overlaps(obj, test)) return obj;
        }

        return undefined;
    }

    clone() {
        const m = new MapObjectLayer();
        m.objects = this.objects.map(o => o.clone());
        return m;
    }
}

export enum MapObjectLayers {
    Decoration = 0,
    Item = 1,
    Interactable = 2,
    Spawner = 3,
    Area = 4
}

export interface ReadonlyMapData {
    getTile(column: number, row: number): number;
    getLayer(layer: MapObjectLayers): MapObjectLayer;
    getLayers(): ReadonlyArray<MapObjectLayer>;
    getBounds(): MapRect;
    clone(): MapData;
}

export interface SetTileOp {
    kind: "settile",
    row: number,
    col: number,
    tileSet: TileSet,
    selectedTiles: MapRect,
}
export interface SetMultiTileOp {
    kind: "multitile",
    bitmask: Bitmask,
    row: number,
    col: number,
    tileSet: TileSet,
    selectedTiles: MapRect,
}
export interface SetObjectOp {
    kind: "setobj",
    obj: MapObject,
    layer: MapObjectLayers
}

export type MapOperation = SetTileOp | SetMultiTileOp | SetObjectOp

export type MapLog = OperationLog<MapData, ReadonlyMapData, MapOperation>

export class MapData implements ReadonlyMapData {
    protected ne: MapQuadrant;
    protected se: MapQuadrant;
    protected sw: MapQuadrant;
    protected nw: MapQuadrant;

    protected layers: MapObjectLayer[];
    protected bounds: MapRect;

    constructor() {
        this.ne = new MapQuadrant();
        this.se = new MapQuadrant();
        this.sw = new MapQuadrant();
        this.nw = new MapQuadrant();

        this.layers = [];

        this.layers[MapObjectLayers.Decoration] = new MapObjectLayer();
        this.layers[MapObjectLayers.Item] = new MapObjectLayer();
        this.layers[MapObjectLayers.Interactable] = new MapObjectLayer();
        this.layers[MapObjectLayers.Spawner] = new MapObjectLayer();
    }

    setTile(column: number, row: number, data: number) {
        this.getQuadrant(column, row).setTile(column, row, data);

        if (this.bounds == null) {
            this.bounds = {
                top: row,
                left: column,
                bottom: row,
                right: column,
                width: 1,
                height: 1,
            };
        }
        else {
            this.bounds.top = Math.min(this.bounds.top, row);
            this.bounds.bottom = Math.max(this.bounds.bottom, row);
            this.bounds.left = Math.min(this.bounds.left, column);
            this.bounds.right = Math.max(this.bounds.right, column);
            this.bounds.width = this.bounds.right - this.bounds.left - 1;
            this.bounds.height = this.bounds.bottom - this.bounds.top - 1;
        }
    }

    setTileGroup(column: number, row: number, selectedTiles: MapRect, tileSet: TileSet) {
        if (!selectedTiles) {
            this.setTile(column, row, -1);
            return;
        }

        for (let r = 0; r < selectedTiles.height; r++) {
            for (let c = 0; c < selectedTiles.width; c++) {
                this.setTile(
                    column + c,
                    row + r,
                    tileSet.coordToIndex(
                        selectedTiles.top + r,
                        selectedTiles.left + c,
                    )
                );
            }
        }
    }

    getTile(column: number, row: number): number {
        return this.getQuadrant(column, row).getTile(column, row);
    }

    addObjectToLayer(layer: MapObjectLayers, obj: MapObject): void {
        if (this.layers[layer]) {
            this.layers[layer].addObject(obj);
        }
    }

    getLayer(layer: MapObjectLayers): MapObjectLayer {
        return this.layers[layer];
    }

    getLayers(): ReadonlyArray<MapObjectLayer> {
        return this.layers;
    }

    protected getQuadrant(x: number, y: number) {
        if (x < 0) {
            if (y < 0) {
                return this.sw;
            }
            return this.nw;
        }
        else if (y < 0) {
            return this.se;
        }
        else {
            return this.ne;
        }
    }

    getBounds(): MapRect {
        return this.bounds;
    }

    clone(): MapData {
        const m = new MapData();
        m.ne = this.ne.clone();
        m.se = this.se.clone();
        m.sw = this.sw.clone();
        m.nw = this.nw.clone();

        m.layers = this.layers.map(l => l.clone());

        m.bounds = this.bounds ? {
            left: this.bounds.left,
            top: this.bounds.top,
            right: this.bounds.right,
            bottom: this.bounds.bottom,
            width: this.bounds.width,
            height: this.bounds.height
        } : undefined;

        return m;
    }
}


export function overlaps(a: MapRect, b: MapRect) {
    return !(a.bottom < b.top || a.top > b.bottom || a.left > b.right || a.right < b.left);
}
