import { ClientCoordinates } from "./util";

export const TILE_SIZE = 16;

export class TileSet {
    columns: number;
    rows: number;

    constructor(public readonly src: HTMLImageElement) {
        this.columns = Math.floor(src.width / TILE_SIZE);
        this.rows = Math.floor(src.height / TILE_SIZE);
    }

    indexToCoord(index: number): ClientCoordinates {
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);

        return {
            clientX: col * TILE_SIZE,
            clientY: row * TILE_SIZE
        };
    }
}