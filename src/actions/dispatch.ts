import * as actions from './types'
import { MapTools } from '../util';
import { MapRect } from '../map';

export const dispatchChangeTool = (tool: MapTools) => ({ type: actions.CHANGE_TOOL, tool })
export const dispatchChangeSelectedObjects = (objects: number[]) => ({ type: actions.CHANGE_SELECTED_OBJECTS, objects})
export const dispatchChangeSelectedTiles = (tiles: number[][]) => ({ type: actions.CHANGE_SELECTED_TILES, tiles})
export const dispatchChangeVisibleRect = (rect: MapRect) => ({ type: actions.CHANGE_VISIBLE_RECT, rect})