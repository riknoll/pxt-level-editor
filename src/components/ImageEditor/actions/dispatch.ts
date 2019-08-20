import * as actions from './types'
import { ImageEditorTool, CursorSize } from '../store/imageReducer';
import { ImageState } from '../store/bitmap';

export const dispatchChangeImageTool = (tool: ImageEditorTool) => ({ type: actions.CHANGE_IMAGE_TOOL, tool });
export const dispatchChangeCursorSize = (cursorSize: CursorSize) => ({ type: actions.CHANGE_CURSOR_SIZE, cursorSize });
export const dispatchChangeSelectedColor = (selectedColor: number) => ({ type: actions.CHANGE_SELECTED_COLOR, selectedColor });
export const dispatchChangeImageDimensions = (imageDimensions: [number, number]) => ({ type: actions.CHANGE_IMAGE_DIMENSIONS, imageDimensions });
export const dispatchChangeKeyModifiers = (keyModifiers: number) => ({ type: actions.CHANGE_KEY_MODIFIERS, keyModifiers });
export const dispatchChangeCursorLocation = (cursorLocation: [number, number]) => ({ type: actions.CHANGE_CURSOR_LOCATION, cursorLocation });

export const dispatchImageEdit = (newState: ImageState) => ({ type: actions.IMAGE_EDIT, newState });
export const dispatchUndoImageEdit = () => ({ type: actions.UNDO_IMAGE_EDIT });
export const dispatchRedoImageEdit = () => ({ type: actions.REDO_IMAGE_EDIT });

export const dispatchToggleAspectRatioLocked = () => ({ type: actions.TOGGLE_ASPECT_RATIO });