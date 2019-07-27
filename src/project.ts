import { MapObjectLayers } from "./map";

export class Project {
    templates: MapObjectTemplate[];
    tilesets: TileSet[];

    constructor() {
        this.templates = [];
        this.tilesets = [];
    }
};

export interface ProjectImage {
    name: string;
    src: ImageBitmap;
}

export interface ProjectSpriteSheet extends ProjectImage {
    height: number;
    width: number;
    frames: string[];
}

export interface SpriteSheetReference {
    sheet: ProjectSpriteSheet;
    index: number;
}

export type ProjectSprite = SpriteSheetReference | ProjectImage;

export function isSpriteSheet(img: ProjectImage): img is ProjectSpriteSheet {
    return !!(img as ProjectSpriteSheet).frames;
}

export function isSpriteSheetReference(sprite: ProjectSprite): sprite is SpriteSheetReference {
    return !!(sprite as SpriteSheetReference).sheet;
}

export class TileSet {
    tiles: ProjectSprite[];
    tileSize: number;
    colors: string[];

    constructor(sheet?: ProjectSpriteSheet) {
        if (sheet) {
            this.tiles = getSpritesFromSheet(sheet);
            this.tileSize = sheet.width;
        }
        else {
            this.tiles = [];
            this.tileSize = 16;
        }
    }

    getTile(index: number): ProjectSprite {
        return this.tiles[index];
    }

    addTile(tile: ProjectSprite) {
        this.tiles.push(tile);
    }
}

export function getSpritesFromSheet(sheet: ProjectSpriteSheet): SpriteSheetReference[] {
    return sheet.frames.map((name, index) => ({ sheet, index }))
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