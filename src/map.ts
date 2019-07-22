export interface MapRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
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
    protected width: number;
    protected height: number;

    constructor() {
        this.data = [];
        this.objects = [];

        this.width = 0;
        this.height = 0;
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

        this.height = Math.max(row + 1, this.height);
        this.width = Math.max(col + 1, this.height);

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

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
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

    getBounds() {
        let bounds: MapRect = {
            left: -Math.max(this.sw.getWidth(), this.nw.getWidth()),
            bottom: -Math.max(this.sw.getHeight(), this.se.getHeight()),
            right: Math.max(this.se.getWidth(), this.ne.getWidth()) - 1,
            top: Math.max(this.nw.getHeight(), this.ne.getHeight()) - 1
        }
        return bounds;
    }
}
