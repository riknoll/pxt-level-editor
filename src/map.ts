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
}

export class MapObject extends MapLocation {
}

export class MapQuadrant {
    protected objects: MapObject[];
    protected data: number[][];

    constructor() {
        this.data = [];
        this.objects = [];
    }

    addObject(obj: MapObject) {
        this.objects.push(obj);
    }

    removeObject(obj: MapObject) {
        const i = this.objects.indexOf(obj);

        if (i >= 0) {
            this.objects.splice(i, 1);
        }
    }

    getObjects() {
        return this.objects.slice();
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

export class MapData {
    protected changeListener: () => void;
    protected ne: MapQuadrant;
    protected se: MapQuadrant;
    protected sw: MapQuadrant;
    protected nw: MapQuadrant;

    constructor() {
        this.ne = new MapQuadrant();
        this.se = new MapQuadrant();
        this.sw = new MapQuadrant();
        this.nw = new MapQuadrant();
    }

    addObject(obj: MapObject) {
        this.getQuadrant(obj.column, obj.row).addObject(obj);

        if (this.changeListener) this.changeListener();
    }

    removeObject(obj: MapObject) {
        this.getQuadrant(obj.column, obj.row).removeObject(obj);

        if (this.changeListener) this.changeListener();
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