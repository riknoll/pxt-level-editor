import { ClientCoordinates } from "./util";
import { array, number } from "prop-types";

export const TILE_SIZE = 16;

export class TileSet {
    columns: number;
    rows: number;
    colors: String[];

    constructor(public readonly src: HTMLImageElement) {
        this.columns = Math.floor(src.width / TILE_SIZE);
        this.rows = Math.floor(src.height / TILE_SIZE);
        this.colors = [];
        //call computing avg color for each tile - double for loop
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');
        ctx.drawImage(src, 0, 0, src.width, src.height);
        for (let x = 0; x<this.rows; x++){
            for (let y = 0; y<this.columns; y++){
                 this.colors.push(this.computeAvgColor(ctx, x, y));
            }
        }
    }

    //index to color
    getColor(int: number):String{
        
        return this.colors[int];
    }

    //computing avg color - takes in HTML Image Element 
    computeAvgColor(ctx:CanvasRenderingContext2D, x: number, y: number):String{
        let imageColor = ctx.getImageData(y*TILE_SIZE, x*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        let r = 0;
        let g = 0;
        let b = 0;
        let iter = 0;
        for (let k = 0; k<TILE_SIZE*TILE_SIZE; k+=4){
            r += imageColor.data[k];
            g += imageColor.data[k+1];
            b += imageColor.data[k+2];
            iter++;
        }
        r/=iter;
        g/=iter;
        b/=iter;
        let rgb = "";
        rgb += r;
        rgb += " ";
        rgb += g;
        rgb += " ";
        rgb += b;
        return rgb;
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