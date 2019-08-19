import * as actions from '../actions/types'
import { ImageState, Bitmap } from './bitmap';

export const enum ImageEditorTool {
    Paint,
    Fill,
    Line,
    Erase,
    Circle,
    Rect,
    ColorSelect,
    Marquee
}

export const enum CursorSize {
    One = 1,
    Three = 3,
    Five = 5
}

export const enum KeyModifiers {
    Alt = 1 << 0,
    Shift = 1 << 1
}

export interface ImageEditorStore {
    visible: boolean;
    colors: string[];
    selectedColor: number;

    tool: ImageEditorTool;
    cursorSize: CursorSize;

    keyModifiers?: number;
    cursorLocation?: [number, number];
    imageDimensions?: [number, number];

    canvasState: {
        past: ImageState[],
        present?: ImageState,
        future: ImageState[]
    }
}

const initialState: ImageEditorStore =  {
    visible: true,
    colors: [
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
    ],
    selectedColor: 0,

    tool: ImageEditorTool.Paint,
    cursorSize: CursorSize.One,
    imageDimensions: [16, 16],

    canvasState: {
        past: [],
        present: {
            bitmap: new Bitmap(16, 16).data()
        },
        future: []
    }
}

const reducer = (state: ImageEditorStore = initialState, action: any) => {
    const canvasState = state.canvasState;

    switch (action.type) {
        case actions.CHANGE_IMAGE_TOOL:
            return { ...state, tool: action.tool };
        case actions.CHANGE_CURSOR_SIZE:
            return { ...state, cursorSize: action.cursorSize };
        case actions.CHANGE_SELECTED_COLOR:
            return { ...state, selectedColor: action.selectedColor };
        case actions.CHANGE_IMAGE_DIMENSIONS:
            return { ...state, imageDimensions: action.imageDimensions };
        case actions.CHANGE_KEY_MODIFIERS:
            return { ...state, keyModifiers: action.keyModifiers };
        case actions.CHANGE_CURSOR_LOCATION:
            return { ...state, cursorLocation: action.cursorLocation };
        case actions.IMAGE_EDIT:
            return {
                ...state,
                canvasState: {
                    past: canvasState.present ? [...canvasState.past, canvasState.present] : canvasState.past,
                    present: action.newState,
                    future: [] as ImageState[],
                }
            };
        case actions.UNDO_IMAGE_EDIT:
            return {
                ...state,
                canvasState: {
                    past: canvasState.past.slice(0, -1),
                    present: canvasState.past[canvasState.past.length - 1],
                    future: canvasState.present ? [...canvasState.future, canvasState.present] : canvasState.future,
                }
            };
        case actions.REDO_IMAGE_EDIT:
            return {
                ...state,
                canvasState: {
                    past: canvasState.present ? [...canvasState.past, canvasState.present] : canvasState.past,
                    present: canvasState.future[canvasState.future.length - 1],
                    future: canvasState.future.slice(0, -1),
                }
            };
        default:
            return state;
    }
}

export default reducer;