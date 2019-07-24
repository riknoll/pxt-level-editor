import { Sprite } from '../SpriteStore';

export interface Dictionary<T> {
    [K: string]: T;
}

export interface Tile {
    category: string;
    name?: string;
    image?: any;
    propertyBag?: Dictionary<string>;
    sprite: Sprite;
}
