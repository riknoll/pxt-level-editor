import { ProjectSprite, isSpriteSheetReference } from "./project";

export interface PaletteInfo {
    name?: string;
    colorStrings: string[];
    colors: number[][];
}

const ARCADE_PALETTE = [
    "#000000",
    "#ffffff",
    "#ff2121",
    "#ff93c4",
    "#ff8135",
    "#fff609",
    "#249ca3",
    "#78dc52",
    "#003fad",
    "#87f2ff",
    "#8e2ec4",
    "#a4839f",
    "#5c406c",
    "#e5cdc4",
    "#91463d",
    "#000000"
];

export const defaultPalette: PaletteInfo = {
    name: "arcade",
    colorStrings: ARCADE_PALETTE,
    colors: toNumbers(ARCADE_PALETTE)
}

export function encodeSpriteToImg(sprite: ProjectSprite, palette = defaultPalette, canvas = document.createElement("canvas")) {
    const ctx = canvas.getContext("2d");

    if (isSpriteSheetReference(sprite)) {
        canvas.width = sprite.width;
        canvas.height = sprite.height;
        ctx.drawImage(
            sprite.sheet.loaded,
            sprite.x,
            sprite.y,
            sprite.width,
            sprite.height,
            0,
            0,
            sprite.width,
            sprite.height
        );
    }
    else {
        canvas.width = sprite.loaded.width;
        canvas.height = sprite.loaded.height;
        ctx.drawImage(sprite.loaded, 0, 0);
    }

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return imgEncodeImg(canvas.width, canvas.height, (x, y) =>
        closestColor(pixels.data, (x + y * canvas.width) << 2, palette.colors, true));
}

export function parseGPLPalette(text: string): PaletteInfo {
    const lines = text.split(/\n/);
    let name: string;
    const colors: string[] = ["#000000"];

    for (const line of lines) {
        if (line.indexOf("#Palette Name:") === 0) {
            name = line.substr(14).trim();
        }
        else if (startsWith(line, "GIMP") || startsWith(line, "#") || !line.trim()) {
            continue;
        }
        else {
            const color = line.split(/\s+/).filter(c => startsWith(c, "#"));
            if (color.length === 1) {
                colors.push(color[0].toLowerCase());
            }
        }
    }

    return {
        name,
        colorStrings: colors,
        colors: toNumbers(colors)
    }
}

export function parseHEXPalette(text: string): PaletteInfo {
    const lines = text.split(/\n/);
    const colors: string[] = ["#000000"];

    for (let line of lines) {
        if (/[A-Fa-f0-9]{6}/.test(line)) {
            colors.push("#" + line.toLowerCase());
        }
    }

    return {
        colorStrings: colors,
        colors: toNumbers(colors)
    }
}

export function parseTXTPalette(text: string): PaletteInfo {
    const lines = text.split(/\n/);
    let name: string;
    const colors: string[] = ["#000000"];

    for (let line of lines) {
        line = line.trim();
        if (startsWith(line, ";Palette Name:")) {
            name = line.substr(14);
        }
        else if (/[A-Fa-f0-9]{6}/.test(line)) {
            colors.push("#" + line.toLowerCase());
        }
        else if (/[A-Fa-f0-9]{8}/.test(line)) {
            // First two characters are alpha, just strip it out
            colors.push("#" + line.substr(2).toLowerCase());
        }
    }

    return {
        name,
        colorStrings: colors,
        colors: toNumbers(colors)
    }
}

export function encodePalette(colors: string[]) {
    const buf = new Uint8Array(colors.length * 3);
    for (let i = 0; i < colors.length; i++) {
        const color = parseColorString(colors[i]);
        const start = i * 3;
        buf[start] = _r(color);
        buf[start + 1] = _g(color);
        buf[start + 2] = _b(color);
    }
    return toHex(buf);
}

export function toNumbers(colors: string[]): number[][] {
    const res: number[][] = [];
    for (let i = 0; i < colors.length; i++) {
        const color = parseColorString(colors[i]);
        res.push([_r(color), _g(color), _b(color)]);
    }
    return res;
}

// use geometric distance on colors
function scale(v: number) {
    return v * v
}

function closestColor(buf: Uint8ClampedArray, pix: number, palette: number[][], alpha = true) {
    if (alpha && buf[pix + 3] < 100)
        return 0 // transparent
    let mindelta = 0
    let idx = -1
    for (let i = alpha ? 1 : 0; i < palette.length; ++i) {
        let delta = scale(palette[i][0] - buf[pix + 0]) + scale(palette[i][1] - buf[pix + 1]) + scale(palette[i][2] - buf[pix + 2])
        if (idx < 0 || delta < mindelta) {
            idx = i
            mindelta = delta
        }
    }
    return idx
}

export function f4EncodeImg(w: number, h: number, bpp: number, getPix: (x: number, y: number) => number) {
    let r = hex2(0xe0 | bpp) + hex2(w) + hex2(h) + "00"
    let ptr = 4
    let curr = 0
    let shift = 0

    let pushBits = (n: number) => {
        curr |= n << shift
        if (shift == 8 - bpp) {
            r += hex2(curr)
            ptr++
            curr = 0
            shift = 0
        } else {
            shift += bpp
        }
    }

    for (let i = 0; i < w; ++i) {
        for (let j = 0; j < h; ++j)
            pushBits(getPix(i, j))
        while (shift != 0)
            pushBits(0)
        if (bpp > 1) {
            while (ptr & 3)
                pushBits(0)
        }
    }

    return r

    function hex2(n: number) {
        return ("0" + n.toString(16)).slice(-2)
    }
}

export function imgEncodeImg(w: number, h: number, getPix: (x: number, y: number) => number) {
    let res = "img`\n    "
    for (let r = 0; r < h; r++) {
        let row: number[] = []
        for (let c = 0; c < w; c++) {
            row.push(getPix(c, r));
        }
        res += row.map(n => n.toString(16)).join(" ");
        res += "\n    "
    }
    res += "`";
    return res;
}

function parseColorString(color: string) {
    if (color) {
        if (color.length === 6) {
            return parseInt("0x" + color);
        }
        else if (color.length === 7) {
            return parseInt("0x" + color.substr(1));
        }
    }
    return 0;
}

function _r(color: number) { return (color >> 16) & 0xff }
function _g(color: number) { return (color >> 8) & 0xff }
function _b(color: number) { return color & 0xff }

function startsWith(str: string, prefix: string) { return str.indexOf(prefix) === 0 }

function toHex(bytes: ArrayLike<number>) {
    let r = ""
    for (let i = 0; i < bytes.length; ++i)
        r += ("0" + bytes[i].toString(16)).slice(-2)
    return r
}