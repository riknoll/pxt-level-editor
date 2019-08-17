import * as actions from '../actions/types'
import { MapTools } from '../util';
import { MapRect, MapObject, Layer } from '../map';

export interface IStore {
    tool: MapTools;
    selectedObjects: number[];
    selectedTiles: number[][];
    showPropertyEditor: boolean;
    activeObject: MapObject;
    visibleRect?: MapRect;
    activeLayer: Layer;
}

const initialState: IStore =  {
    tool: MapTools.Stamp,
    selectedObjects: [],
    selectedTiles: [],
    activeObject: null,
    showPropertyEditor: false,
    activeLayer: Layer.Terrain
}

const reducer = (state: IStore = initialState, action: any) => {
  switch (action.type) {
      case actions.CHANGE_TOOL:
          return { ...state, tool: action.tool };
      case actions.CHANGE_SELECTED_OBJECTS:
          return { ...state, selectedObjects: action.objects };
      case actions.CHANGE_SELECTED_TILES:
          return { ...state, selectedTiles: action.tiles };
      case actions.CHANGE_VISIBLE_RECT:
          return { ...state, visibleRect: action.rect };
      case actions.TOGGLE_PROPERTY_EDITOR:
          return { ...state, showPropertyEditor: action.show, activeObject: action.obj };
      case actions.CHANGE_ACTIVE_LAYER:
          return { ...state, activeLayer: action.activeLayer };
      default:
          return state;
  }
}

export default reducer;