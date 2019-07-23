import { ClientCoordinates } from "./util";

export const TILE_SIZE = 16;

export class TileSet {
    columns: number;
    rows: number;
    tileSize: number;

    constructor(public readonly src: HTMLImageElement, tileSize?: number) {
        this.tileSize = tileSize || TILE_SIZE;
        this.columns = Math.floor(src.width / (this.tileSize));
        this.rows = Math.floor(src.height / (this.tileSize));
    }

    indexToCoord(index: number): ClientCoordinates {
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);

        return {
            clientX: col * (this.tileSize),
            clientY: row * (this.tileSize)
        };
    }
}