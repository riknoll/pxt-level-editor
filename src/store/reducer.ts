import * as actions from '../actions/types'
import { MapTools } from '../util';
import { MapRect } from '../map';

export interface IStore {
    tool: MapTools;
    selectedObjects: number[];
    selectedTiles: number[][];
    visibleRect?: MapRect;
}

const initialState: IStore =  {
    tool: MapTools.Stamp,
    selectedObjects: [],
    selectedTiles: []
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
      default:
          return state;
  }
}

export default reducer;