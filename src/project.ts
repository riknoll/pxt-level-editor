import { MapObjectLayers } from "./map";
import { loadBitmapAsync, requestJSONAsync, Color } from "./util";

export class Project {
    images: ProjectImage[];
    templates: MapObjectTemplate[][];
    tiles: ProjectSprite[];
    tileSize = 16;
    canvas: HTMLCanvasElement;

    protected tileColors: Color[];

    constructor() {
        this.images = [];
        this.templates = [[], [], [], [], [], [], []];
        this.tiles = [];
        this.tileColors = [];

        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
    }

    async loadImagesAsync() {
        for (const img of this.images) {
            if (!img.loaded) img.loaded = await loadBitmapAsync(img.src);
            else continue;
        }
    }

    addImage(image: ProjectImage) {
        if (this.images.indexOf(image) === -1) {
            this.images.push(image);
        }
    }

    newTemplate(layer: MapObjectLayers, sprite: ProjectSprite) {
        if (!this.templates[layer]) this.templates[layer] = [];

        if (isSpriteSheetReference(sprite)) {
            this.addImage(sprite.sheet);
        }
        else if (this.images.indexOf(sprite) === -1) {
            this.addImage(sprite);
        }

        const temp = new MapObjectTemplate(layer, sprite);
        this.templates[layer].push(temp);

        return temp;
    }

    addTile(sprite: ProjectSprite) {
        this.tiles.push(sprite);
        this.tileColors.push(this.computeAvgColor(sprite));
    }

    getColor(index: number): Color {
        return this.tileColors[index];
    }

    computeAvgColor(sprite: ProjectSprite): Color {
        const ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        if (isSpriteSheetReference(sprite)) {
            this.canvas.width = sprite.width;
            this.canvas.height = sprite.height;
            ctx.drawImage(sprite.sheet.loaded, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);
        }
        else {
            this.canvas.width = sprite.loaded.width;
            this.canvas.height = sprite.loaded.height;
            ctx.drawImage(sprite.loaded, 0, 0);
        }

        let tile = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let color: Color = {r: 0, g: 0, b: 0};

        let tilePixels = this.tileSize * this.tileSize;

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
};

export interface ProjectImage {
    src: string;
    name: string;

    loaded?: HTMLCanvasElement | ImageBitmap;
}

export interface ProjectSpriteSheet extends ProjectImage {
    meta: SpriteSheetMeta;
}

export interface SpriteSheetMeta {
    terrain: SpriteSheetReference[];
    decorations: SpriteSheetReference[];
    interactables: SpriteSheetReference[];
    collectibles: SpriteSheetReference[];
    spawners: SpriteSheetReference[];
}

export interface SpriteSheetReference {
    name: string;
    x: number;
    y: number;
    height: number;
    width: number;
    group?: string;
    sheet?: ProjectSpriteSheet;
}

export type ProjectSprite = SpriteSheetReference | ProjectImage;

export function isSpriteSheet(img: ProjectImage): img is ProjectSpriteSheet {
    return !!(img as ProjectSpriteSheet).meta;
}

export function isSpriteSheetReference(sprite: ProjectSprite): sprite is SpriteSheetReference {
    return !!(sprite as SpriteSheetReference).sheet;
}

export enum MapObjectPropertyType {
    String,
    Number,
    Boolean
}

export class MapObjectProperty {
    constructor(public readonly type: MapObjectPropertyType, public readonly name: string, public defaultValue: string | number | boolean) {}
}

export class MapObjectTemplate {
    props: MapObjectProperty[];

    constructor(public layer: MapObjectLayers, public sprite?: ProjectSprite) {
        this.props = [];
    }

    addProperty(prop: MapObjectProperty): boolean {
        for (const p of this.props) {
            if (prop.name === p.name) {
                return false;
            }
        }

        this.props.push(prop);
        return true;
    }

    removeProperty(name: string) {
        for (let i = 0; i < this.props.length; i++) {
            if (this.props[i].name === name) {
                this.props = this.props.splice(i, 1);
                return;
            }
        }
    }
}

export async function loadExampleAsync(name: string) {
    const meta = await requestJSONAsync(`./${name}.json`) as SpriteSheetMeta;
    const sheet: ProjectSpriteSheet = {
        name,
        src: `./${name}.png`,
        meta
    };

    const p = new Project();

    p.addImage(sheet);
    await p.loadImagesAsync();

    for (const tile of meta.terrain) {
        tile.sheet = sheet;
        p.addTile(tile);
    }

    for (const sprite of meta.decorations) {
        sprite.sheet = sheet;
        p.newTemplate(MapObjectLayers.Decoration, sprite);
    }

    for (const sprite of meta.collectibles) {
        sprite.sheet = sheet;
        p.newTemplate(MapObjectLayers.Item, sprite);
    }

    for (const sprite of meta.interactables) {
        sprite.sheet = sheet;
        p.newTemplate(MapObjectLayers.Interactable, sprite);
    }

    for (const sprite of meta.spawners) {
        sprite.sheet = sheet;
        p.newTemplate(MapObjectLayers.Spawner, sprite);
    }

    return p;
}