import { ClientCoordinates, Color } from "./util";
import { array, number } from "prop-types";

export const TILE_SIZE = 16;

export class TileSet {
    columns: number;
    rows: number;
    tileSize: number;
    colors: Color[];

    constructor(public readonly src: HTMLImageElement, tileSize?: number) {
        this.tileSize = tileSize || TILE_SIZE;
        this.columns = Math.floor(src.width / (this.tileSize));
        this.rows = Math.floor(src.height / (this.tileSize));
        this.colors = [];

        //call computing avg color for each tile - double for loop
        const canvas = document.createElement("canvas");
        canvas.width = src.width;
        canvas.height = src.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(src, 0, 0, src.width, src.height);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.columns; col++) {
                 this.colors.push(this.computeAvgColor(ctx, row, col));
            }
        }
    }

    //index to color
    getColor(int: number): Color {
        return this.colors[int];
    }

    //computing avg color - takes in HTML Image Element
    computeAvgColor(
            ctx: CanvasRenderingContext2D, row: number, col: number): Color {
        let tile = ctx.getImageData(
            col * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            this.tileSize
        );

        let color: Color = {r: 0, g: 0, b: 0};

        let tilePixels = this.tileSize * this.tileSize;

        if (row == 9)
            console.log(tile.data);

        for (let k = 0; k < tilePixels; k++) {
            color.r += tile.data[4 * k];
            color.g += tile.data[4 * k + 1];
            color.b += tile.data[4 * k + 2];
        }

        color.r /= tilePixels;
        color.g /= tilePixels;
        color.b /= tilePixels;

        return color;
    }

    indexToCoord(index: number): ClientCoordinates {
        const col = index % this.columns;
        const row = Math.floor(index / this.columns);

        return {
            clientX: col * (this.tileSize),
            clientY: row * (this.tileSize)
        };
    }

    coordToIndex(row: number, col: number) {
        return col + row * this.columns;
    }
}
