import * as actions from './types'
import { MapTools } from '../util';
import { MapRect, MapObject, Layer } from '../map';

export const dispatchChangeTool = (tool: MapTools) => ({ type: actions.CHANGE_TOOL, tool })
export const dispatchChangeSelectedObjects = (objects: number[]) => ({ type: actions.CHANGE_SELECTED_OBJECTS, objects})
export const dispatchChangeSelectedTiles = (tiles: number[][]) => ({ type: actions.CHANGE_SELECTED_TILES, tiles})
export const dispatchChangeVisibleRect = (rect: MapRect) => ({ type: actions.CHANGE_VISIBLE_RECT, rect})
export const dispatchTogglePropertyEditor = (show: boolean, obj?: MapObject) => ({ type: actions.TOGGLE_PROPERTY_EDITOR, show, obj})
export const dispatchChangeActiveLayer = (activeLayer: Layer ) => ({ type: actions.CHANGE_ACTIVE_LAYER, activeLayer})