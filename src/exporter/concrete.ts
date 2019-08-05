
import { AbstractEmitter } from "./abstract";
import { ProjectSprite } from "../project";
import { encodeSpriteToImg } from "../encode"

// will need to rewire to connect with redux, hooking up as an arbitrary obj for now for testing.
interface MapState {
    selectedTiles: number[][];
    tiles: ProjectSprite[];
}

export class ConcreteEmitter extends AbstractEmitter {

    output(obj: any): string {
        const { selectedTiles, tiles } = obj as MapState;
        // Keep this in line with the groups listed in /levels.ts
        const identifiers = `!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ`;

        return this.outputHeader() + `
namespace level {

    export const mylevel = new level.Level(\`
    ${
        selectedTiles.reduce((acc, curr) => {
            return acc + curr.map(ind => identifiers[ind]).join("") + "\n"
        }, "")
    }\`)

    ${
        tiles.reduce((acc, curr, index) => {
            return acc + `
    level.registerSprite(${identifiers[index]}, ${encodeSpriteToImg(curr)});`
        }, "")
    }
}`;
    }
}