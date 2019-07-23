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
        return MapObject.nextID ++;
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
}

export enum MapObjectLayers {
    Decoration = 0,
    Item = 1,
    Interactable = 2,
    Spawner = 3,
    Area = 4
}

export class MapData {
    protected changeListener: () => void;
    protected ne: MapQuadrant;
    protected se: MapQuadrant;
    protected sw: MapQuadrant;
    protected nw: MapQuadrant;

    protected layers: MapObjectLayer[];

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

        if (this.changeListener) this.changeListener();
    }

    getTile(column: number, row: number) {
        return this.getQuadrant(column, row).getTile(column, row);
    }

    onChange(cb: () => void) {
        this.changeListener = cb;
    }

    addObjectToLayer(layer: MapObjectLayers, obj: MapObject) {
        if (this.layers[layer]) {
            this.layers[layer].addObject(obj);
        }
    }

    getLayer(layer: MapObjectLayers) {
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
}


export function overlaps(a: MapRect, b: MapRect) {
    return !(a.bottom < b.top || a.top > b.bottom || a.left > b.right || a.right < b.left);
}