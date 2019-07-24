declare namespace pxtsprite {
    interface Coord {
        x: number;
        y: number;
    }
    class Bitmap {
        width: number;
        height: number;
        x0: number;
        y0: number;
        protected buf: Uint8Array;
        constructor(width: number, height: number, x0?: number, y0?: number);
        set(col: number, row: number, value: number): void;
        get(col: number, row: number): number;
        copy(col?: number, row?: number, width?: number, height?: number): Bitmap;
        apply(change: Bitmap, transparent?: boolean): void;
        equals(other: Bitmap): boolean;
        protected coordToIndex(col: number, row: number): number;
        protected getCore(index: number): number;
        protected setCore(index: number, value: number): void;
    }
    class Bitmask {
        width: number;
        height: number;
        protected mask: Uint8Array;
        constructor(width: number, height: number);
        set(col: number, row: number): void;
        get(col: number, row: number): number;
    }
    function resizeBitmap(img: Bitmap, width: number, height: number): Bitmap;
    function imageLiteralToBitmap(text: string, defaultPattern?: string): Bitmap;
    function bitmapToImageLiteral(bitmap: Bitmap): string;
}
declare namespace pxtsprite {
    interface ButtonGroup {
        root: svg.Group;
        cx: number;
        cy: number;
    }
    interface ToggleProps {
        baseColor: string;
        borderColor: string;
        backgroundColor: string;
        switchColor: string;
        unselectedTextColor: string;
        selectedTextColor: string;
        leftText: string;
        leftIcon: string;
        rightText: string;
        rightIcon: string;
    }
    class Toggle {
        protected leftElement: svg.Group;
        protected leftText: svg.Text;
        protected rightElement: svg.Group;
        protected rightText: svg.Text;
        protected switch: svg.Rect;
        protected root: svg.Group;
        protected props: ToggleProps;
        protected isLeft: boolean;
        protected changeHandler: (left: boolean) => void;
        constructor(parent: svg.SVG, props: Partial<ToggleProps>);
        protected buildDom(): void;
        toggle(quiet?: boolean): void;
        onStateChange(handler: (left: boolean) => void): void;
        layout(): void;
        translate(x: number, y: number): void;
        height(): number;
        width(): number;
    }
    class Button {
        cx: number;
        cy: number;
        root: svg.Group;
        clickHandler: () => void;
        private _title;
        private _shortcut;
        constructor(root: svg.Group, cx: number, cy: number);
        getElement(): svg.Group;
        addClass(className: string): void;
        removeClass(className: string): void;
        onClick(clickHandler: () => void): void;
        translate(x: number, y: number): void;
        title(text: string): void;
        shortcut(text: string): void;
        private setRootTitle;
        setDisabled(disabled: boolean): void;
        setSelected(selected: boolean): void;
        protected layout(): void;
        protected editClass(className: string, add: boolean): void;
    }
    class TextButton extends Button {
        protected textEl: svg.Text;
        constructor(button: ButtonGroup, text: string, className: string);
        setText(text: string): void;
        getComputedTextLength(): number;
    }
    class StandaloneTextButton extends TextButton {
        readonly height: number;
        protected padding: number;
        constructor(text: string, height: number);
        layout(): void;
        width(): number;
    }
    class CursorButton extends Button {
        constructor(root: svg.Group, cx: number, cy: number, width: number);
    }
    function mkIconButton(icon: string, width: number, height?: number): TextButton;
    function mkXIconButton(icon: string, width: number, height?: number): TextButton;
    function mkTextButton(text: string, width: number, height: number): TextButton;
    class CursorMultiButton {
        root: svg.Group;
        selected: number;
        buttons: Button[];
        indexHandler: (index: number) => void;
        constructor(parent: svg.Group, width: number);
        protected handleClick(index: number): void;
        onSelected(cb: (index: number) => void): void;
    }
    interface UndoRedoHost {
        undo(): void;
        redo(): void;
    }
    class UndoRedoGroup {
        root: svg.Group;
        undo: TextButton;
        redo: TextButton;
        host: UndoRedoHost;
        constructor(parent: svg.Group, host: UndoRedoHost, width: number, height: number);
        translate(x: number, y: number): void;
        updateState(undo: boolean, redo: boolean): void;
    }
    function mkText(text: string): svg.Text;
}
declare namespace pxtsprite {
    class CanvasGrid {
        protected palette: string[];
        state: CanvasState;
        protected lightMode: boolean;
        protected cellWidth: number;
        protected cellHeight: number;
        private gesture;
        private context;
        private fadeAnimation;
        private selectAnimation;
        protected backgroundLayer: HTMLCanvasElement;
        protected paintLayer: HTMLCanvasElement;
        protected overlayLayer: HTMLCanvasElement;
        mouseCol: number;
        mouseRow: number;
        constructor(palette: string[], state: CanvasState, lightMode?: boolean);
        readonly image: Bitmap;
        setEyedropperMouse(on: boolean): void;
        repaint(): void;
        applyEdit(edit: Edit, cursorCol: number, cursorRow: number, gestureEnd?: boolean): void;
        drawCursor(edit: Edit, col: number, row: number): void;
        bitmap(): Bitmap;
        outerWidth(): number;
        outerHeight(): number;
        writeColor(col: number, row: number, color: number): void;
        drawColor(col: number, row: number, color: number, context?: CanvasRenderingContext2D, transparency?: boolean): void;
        restore(state: CanvasState, repaint?: boolean): void;
        showResizeOverlay(): void;
        showOverlay(): void;
        hideOverlay(): void;
        resizeGrid(rowLength: number, numCells: number): void;
        setCellDimensions(width: number, height: number): void;
        setGridDimensions(width: number, height?: number, lockAspectRatio?: boolean): void;
        down(handler: (col: number, row: number) => void): void;
        up(handler: (col: number, row: number) => void): void;
        drag(handler: (col: number, row: number) => void): void;
        move(handler: (col: number, row: number) => void): void;
        leave(handler: () => void): void;
        updateBounds(top: number, left: number, width: number, height: number): void;
        render(parent: HTMLDivElement): void;
        removeMouseListeners(): void;
        onEditStart(col: number, row: number, edit: Edit): void;
        onEditEnd(col: number, row: number, edit: Edit): void;
        protected drawImage(image?: Bitmap, context?: CanvasRenderingContext2D, left?: number, top?: number, transparency?: boolean): void;
        protected drawBackground(): void;
        protected clientEventToCell(ev: MouseEvent): number[];
        protected drawFloatingLayer(): void;
        protected drawSelectionAnimation(dashOffset?: number): void;
        private clearContext;
        private initDragSurface;
        private bindEvents;
        private upHandler;
        private leaveHandler;
        private moveHandler;
        private hoverHandler;
        private startDrag;
        private endDrag;
        private layoutCanvas;
        private stopSelectAnimation;
    }
    interface ClientCoordinates {
        clientX: number;
        clientY: number;
    }
}
declare namespace pxtsprite {
    class CanvasState {
        image: Bitmap;
        floatingLayer: Bitmap;
        layerOffsetX: number;
        layerOffsetY: number;
        constructor(bitmap?: Bitmap);
        readonly width: number;
        readonly height: number;
        copy(): CanvasState;
        equals(other: CanvasState): boolean;
        mergeFloatingLayer(): void;
        copyToLayer(left: number, top: number, width: number, height: number, cut?: boolean): void;
        inFloatingLayer(col: number, row: number): boolean;
    }
}
declare namespace pxtsprite {
    interface SpriteHeaderHost {
        showGallery(): void;
        hideGallery(): void;
    }
    class SpriteHeader {
        protected host: SpriteHeaderHost;
        div: HTMLDivElement;
        root: svg.SVG;
        toggle: Toggle;
        undoButton: Button;
        redoButton: Button;
        constructor(host: SpriteHeaderHost);
        getElement(): HTMLDivElement;
        layout(): void;
    }
}
declare function makeCloseButton(): HTMLDivElement;
declare namespace pxtsprite {
    interface ReporterHost extends UndoRedoHost {
        resize(width: number, height: number): void;
        closeEditor(): void;
    }
    class ReporterBar {
        protected host: ReporterHost;
        protected height: number;
        root: svg.Group;
        cursorText: svg.Text;
        sizeButton: TextButton;
        doneButton: StandaloneTextButton;
        undoRedo: UndoRedoGroup;
        protected sizePresets: [number, number][];
        protected sizeIndex: number;
        constructor(parent: svg.Group, host: ReporterHost, height: number);
        updateDimensions(width: number, height: number): void;
        hideCursor(): void;
        updateCursor(col: number, row: number): void;
        updateUndoRedo(undo: boolean, redo: boolean): void;
        layout(top: number, left: number, width: number): void;
        setSizePresets(presets: [number, number][], currentWidth: number, currentHeight: number): void;
        protected nextSize(): void;
    }
}
declare namespace pxtsprite {
    interface SideBarHost {
        setActiveTool(tool: PaintTool): void;
        setActiveColor(color: number): void;
        setToolWidth(width: number): void;
        setIconsToDefault(): void;
    }
    class SideBar {
        root: svg.Group;
        host: SideBarHost;
        palette: string[];
        protected colorSwatches: svg.Rect[];
        protected pencilTool: Button;
        protected eraseTool: Button;
        protected rectangleTool: Button;
        protected fillTool: Button;
        protected marqueeTool: Button;
        protected sizeGroup: svg.Group;
        protected buttonGroup: svg.Group;
        protected paletteGroup: svg.Group;
        protected selectedTool: Button;
        protected selectedSwatch: svg.Rect;
        protected colorPreview: svg.Rect;
        constructor(palette: string[], host: SideBarHost, parent: svg.Group);
        setTool(tool: PaintTool): void;
        setColor(color: number): void;
        setCursorSize(size: number): void;
        setWidth(width: number): void;
        translate(left: number, top: number): void;
        protected initSizes(): void;
        protected initTools(): void;
        protected initPalette(): void;
        protected initButton(title: string, icon: string, tool: PaintTool, xicon?: boolean): TextButton;
        getButtonForTool(tool: PaintTool): Button;
    }
}
declare namespace pxtsprite {
    enum PaintTool {
        Normal = 0,
        Rectangle = 1,
        Outline = 2,
        Circle = 3,
        Fill = 4,
        Line = 5,
        Erase = 6,
        Marquee = 7
    }
    function getPaintToolShortcut(tool: PaintTool): "b" | "p" | "s" | "c" | "e" | "r" | "l";
    class Cursor {
        readonly width: number;
        readonly height: number;
        offsetX: number;
        offsetY: number;
        constructor(width: number, height: number);
    }
    abstract class Edit {
        protected canvasWidth: number;
        protected canvasHeight: number;
        color: number;
        protected toolWidth: number;
        protected startCol: number;
        protected startRow: number;
        isStarted: boolean;
        showPreview: boolean;
        constructor(canvasWidth: number, canvasHeight: number, color: number, toolWidth: number);
        abstract update(col: number, row: number): void;
        protected abstract doEditCore(state: CanvasState): void;
        doEdit(state: CanvasState): void;
        start(cursorCol: number, cursorRow: number, state: CanvasState): void;
        end(col: number, row: number, state: CanvasState): void;
        getCursor(): Cursor;
        drawCursor(col: number, row: number, draw: (c: number, r: number) => void): void;
    }
    abstract class SelectionEdit extends Edit {
        protected endCol: number;
        protected endRow: number;
        protected isDragged: boolean;
        update(col: number, row: number): void;
        protected topLeft(): Coord;
        protected bottomRight(): Coord;
    }
    class PaintEdit extends Edit {
        protected mask: Bitmask;
        showPreview: boolean;
        constructor(canvasWidth: number, canvasHeight: number, color: number, toolWidth: number);
        update(col: number, row: number): void;
        protected interpolate(x0: number, y0: number, x1: number, y1: number): void;
        protected doEditCore(state: CanvasState): void;
        drawCursor(col: number, row: number, draw: (c: number, r: number) => void): void;
        protected drawCore(col: number, row: number, setPixel: (col: number, row: number) => void): void;
    }
    class RectangleEdit extends SelectionEdit {
        showPreview: boolean;
        protected doEditCore(state: CanvasState): void;
    }
    class OutlineEdit extends SelectionEdit {
        showPreview: boolean;
        protected doEditCore(state: CanvasState): void;
        protected drawRectangle(state: CanvasState, tl: Coord, br: Coord): void;
        drawCursor(col: number, row: number, draw: (c: number, r: number) => void): void;
        protected drawCore(col: number, row: number, setPixel: (col: number, row: number) => void): void;
    }
    class LineEdit extends SelectionEdit {
        showPreview: boolean;
        protected doEditCore(state: CanvasState): void;
        protected bresenham(x0: number, y0: number, x1: number, y1: number, state: CanvasState): void;
        drawCursor(col: number, row: number, draw: (c: number, r: number) => void): void;
        protected drawCore(col: number, row: number, draw: (c: number, r: number) => void): void;
    }
    class CircleEdit extends SelectionEdit {
        showPreview: boolean;
        protected doEditCore(state: CanvasState): void;
        midpoint(cx: number, cy: number, radius: number, state: CanvasState): void;
        getCursor(): Cursor;
    }
    class FillEdit extends Edit {
        protected col: number;
        protected row: number;
        showPreview: boolean;
        start(col: number, row: number, state: CanvasState): void;
        update(col: number, row: number): void;
        protected doEditCore(state: CanvasState): void;
        getCursor(): Cursor;
    }
    class MarqueeEdit extends SelectionEdit {
        protected isMove: boolean;
        showPreview: boolean;
        start(cursorCol: number, cursorRow: number, state: CanvasState): void;
        end(cursorCol: number, cursorRow: number, state: CanvasState): void;
        protected doEditCore(state: CanvasState): void;
        getCursor(): Cursor;
    }
}
declare namespace pxtsprite {
    const TOTAL_HEIGHT = 500;
    const HEADER_HEIGHT = 50;
    class SpriteEditor implements SideBarHost, SpriteHeaderHost {
        protected lightMode: boolean;
        private group;
        private root;
        private paintSurface;
        private sidebar;
        private header;
        private bottomBar;
        private state;
        private cachedState;
        private edit;
        private activeTool;
        private toolWidth;
        private color;
        private cursorCol;
        private cursorRow;
        private undoStack;
        private redoStack;
        private columns;
        private rows;
        private colors;
        private shiftDown;
        private altDown;
        private mouseDown;
        private closeHandler;
        constructor(bitmap: Bitmap, blocksInfo: any, lightMode?: boolean);
        setCell(col: number, row: number, color: number, commit: boolean): void;
        render(el: HTMLDivElement): void;
        layout(): void;
        rePaint(): void;
        setActiveColor(color: number, setPalette?: boolean): void;
        setActiveTool(tool: PaintTool): void;
        setToolWidth(width: number): void;
        initializeUndoRedo(undoStack: CanvasState[], redoStack: CanvasState[]): void;
        getUndoStack(): CanvasState[];
        getRedoStack(): CanvasState[];
        undo(): void;
        redo(): void;
        resize(width: number, height: number): void;
        setSizePresets(presets: [number, number][]): void;
        canvasWidth(): number;
        canvasHeight(): number;
        outerWidth(): number;
        outerHeight(): number;
        bitmap(): CanvasState;
        showGallery(): void;
        hideGallery(): void;
        closeEditor(): void;
        onClose(handler: () => void): void;
        switchIconTo(tool: PaintTool): void;
        setIconsToDefault(): void;
        private keyDown;
        private keyUp;
        private undoRedoEvent;
        addKeyListeners(): void;
        removeKeyListeners(): void;
        private afterResize;
        private drawCursor;
        private paintEdit;
        private commit;
        private pushState;
        private discardEdit;
        private updateEdit;
        private restore;
        private updateUndoRedo;
        private paintCell;
        private newEdit;
        private shiftAction;
        private clearShiftAction;
        private debug;
        private createDefs;
    }
}
declare namespace svg {
    type Map<T> = {
        [index: string]: T;
    };
    type PointerHandler = () => void;
    enum PatternUnits {
        userSpaceOnUse = 0,
        objectBoundingBox = 1
    }
    enum LengthUnit {
        em = 0,
        ex = 1,
        px = 2,
        in = 3,
        cm = 4,
        mm = 5,
        pt = 6,
        pc = 7,
        percent = 8
    }
    class BaseElement<T extends SVGElement> {
        el: T;
        protected titleElement: SVGTitleElement;
        constructor(type: string);
        attr(attributes: Map<string | number | boolean>): this;
        setAttribute(name: string, value: string | number | boolean): this;
        setAttributeNS(ns: string, name: string, value: string | number | boolean): this;
        id(id: string): this;
        setClass(...classes: string[]): this;
        addClassInternal(el: SVGElement | HTMLElement, classes: string): void;
        removeClassInternal(el: SVGElement | HTMLElement, classes: string): void;
        appendClass(className: string): this;
        removeClass(className: string): void;
        title(text: string): void;
        setVisible(visible: boolean): this;
    }
    class DrawContext<T extends SVGElement> extends BaseElement<T> {
        draw(type: "text"): Text;
        draw(type: "circle"): Circle;
        draw(type: "rect"): Rect;
        draw(type: "line"): Line;
        draw(type: "polygon"): Polygon;
        draw(type: "polyline"): Polyline;
        draw(type: "path"): Path;
        element(type: "text", cb: (newElement: Text) => void): this;
        element(type: "circle", cb: (newElement: Circle) => void): this;
        element(type: "rect", cb: (newElement: Rect) => void): this;
        element(type: "line", cb: (newElement: Line) => void): this;
        element(type: "polygon", cb: (newElement: Polygon) => void): this;
        element(type: "polyline", cb: (newElement: Polyline) => void): this;
        element(type: "path", cb: (newElement: Path) => void): this;
        group(): Group;
        appendChild<T extends SVGElement>(child: BaseElement<T>): void;
        onDown(handler: PointerHandler): this;
        onUp(handler: PointerHandler): this;
        onMove(handler: PointerHandler): this;
        onEnter(handler: (isDown: boolean) => void): this;
        onLeave(handler: PointerHandler): this;
        onClick(handler: PointerHandler): this;
    }
    class SVG extends DrawContext<SVGSVGElement> {
        defs: DefsElement;
        constructor(parent?: Element);
        define(cb: (defs: DefsElement) => void): this;
    }
    class Group extends DrawContext<SVGGElement> {
        top: number;
        left: number;
        scaleFactor: number;
        constructor(parent?: SVGElement);
        translate(x: number, y: number): this;
        scale(factor: number): this;
        def(): DefsElement;
        style(): StyleElement;
        private updateTransform;
    }
    class Pattern extends DrawContext<SVGPatternElement> {
        constructor();
        units(kind: PatternUnits): this;
        contentUnits(kind: PatternUnits): this;
        size(width: number, height: number): this;
    }
    class DefsElement extends BaseElement<SVGDefsElement> {
        constructor(parent: SVGElement);
        create(type: "path", id: string): Path;
        create(type: "pattern", id: string): Pattern;
        create(type: "radialGradient", id: string): RadialGradient;
        create(type: "linearGradient", id: string): LinearGradient;
        create(type: "clipPath", id: string): ClipPath;
    }
    class StyleElement extends BaseElement<SVGStyleElement> {
        constructor(parent: SVGElement);
        content(css: string): void;
    }
    class Drawable<T extends SVGElement> extends DrawContext<T> {
        at(x: number, y: number): this;
        moveTo(x: number, y: number): this;
        fill(color: string, opacity?: number): this;
        opacity(opacity: number): this;
        stroke(color: string, width?: number): this;
        strokeWidth(width: number): this;
        strokeOpacity(opacity: number): this;
        clipPath(url: string): this;
    }
    class Text extends Drawable<SVGTextElement> {
        constructor(text?: string);
        text(text: string): this;
        fontFamily(family: string): this;
        fontSize(size: number, units: LengthUnit): this;
        offset(dx: number, dy: number, units: LengthUnit): this;
        anchor(type: "start" | "middle" | "end" | "inherit"): this;
    }
    class Rect extends Drawable<SVGRectElement> {
        constructor();
        width(width: number, unit?: LengthUnit): this;
        height(height: number, unit?: LengthUnit): this;
        corner(radius: number): this;
        corners(rx: number, ry: number): this;
        size(width: number, height: number, unit?: LengthUnit): this;
    }
    class Circle extends Drawable<SVGCircleElement> {
        constructor();
        at(cx: number, cy: number): this;
        radius(r: number): this;
    }
    class Line extends Drawable<SVGLineElement> {
        constructor();
        at(x1: number, y1: number, x2?: number, y2?: number): this;
        from(x1: number, y1: number): this;
        to(x2: number, y2: number): this;
    }
    class PolyElement<T extends SVGPolygonElement | SVGPolylineElement> extends Drawable<T> {
        points(points: string): this;
        with(points: {
            x: number;
            y: number;
        }[]): this;
    }
    class Polyline extends PolyElement<SVGPolylineElement> {
        constructor();
    }
    class Polygon extends PolyElement<SVGPolygonElement> {
        constructor();
    }
    class Path extends Drawable<SVGPathElement> {
        d: PathContext;
        constructor();
        update(): this;
        path(cb: (d: PathContext) => void): this;
    }
    class Image extends Drawable<SVGImageElement> {
        constructor();
        src(url: string): this;
        width(width: number, unit?: LengthUnit): this;
        height(height: number, unit?: LengthUnit): this;
        size(width: number, height: number, unit?: LengthUnit): this;
    }
    class Gradient<T extends SVGGradientElement> extends BaseElement<T> {
        units(kind: PatternUnits): this;
        stop(offset: number, color?: string, opacity?: string): this;
    }
    class LinearGradient extends Gradient<SVGLinearGradientElement> {
        constructor();
        start(x1: number, y1: number): this;
        end(x2: number, y2: number): this;
    }
    class RadialGradient extends Gradient<SVGRadialGradientElement> {
        constructor();
        center(cx: number, cy: number): this;
        focus(fx: number, fy: number, fr: number): this;
        radius(r: number): this;
    }
    class ClipPath extends DrawContext<SVGClipPathElement> {
        constructor();
        clipPathUnits(objectBoundingBox: boolean): this;
    }
    type OperatorSymbol = "m" | "M" | "l" | "L" | "c" | "C" | "q" | "Q" | "T" | "t" | "S" | "s" | "z" | "Z" | "A" | "a";
    interface PathOp {
        op: OperatorSymbol;
        args: number[];
    }
    class PathContext {
        private ops;
        clear(): void;
        moveTo(x: number, y: number): this;
        moveBy(dx: number, dy: number): this;
        lineTo(x: number, y: number): this;
        lineBy(dx: number, dy: number): this;
        cCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this;
        cCurveBy(dc1x: number, dc1y: number, dc2x: number, dc2y: number, dx: number, dy: number): this;
        qCurveTo(cx: number, cy: number, x: number, y: number): this;
        qCurveBy(dcx: number, dcy: number, dx: number, dy: number): this;
        sCurveTo(cx: number, cy: number, x: number, y: number): this;
        sCurveBy(dcx: number, dcy: number, dx: number, dy: number): this;
        tCurveTo(x: number, y: number): this;
        tCurveBy(dx: number, dy: number): this;
        arcTo(rx: number, ry: number, xRotate: number, large: boolean, sweepClockwise: boolean, x: number, y: number): this;
        arcBy(rx: number, ry: number, xRotate: number, large: boolean, sweepClockwise: boolean, x: number, y: number): this;
        close(): this;
        toAttribute(): string;
        private op;
    }
}
declare namespace events {
    function isTouchEnabled(): boolean;
    function hasPointerEvents(): boolean;
    function down(el: SVGElement, handler: () => void): void;
    function up(el: SVGElement, handler: () => void): void;
    function enter(el: SVGElement, handler: (isDown: boolean) => void): void;
    function leave(el: SVGElement, handler: () => void): void;
    function move(el: SVGElement, handler: () => void): void;
    function click(el: SVGElement, handler: () => void): void;
}
declare namespace utils {
    const DRAG_RADIUS = 3;
    function hasPointerEvents(): boolean;
    function isTouchEnabled(): boolean;
    enum MapTools {
        Pan = 0,
        Stamp = 1,
        Erase = 2
    }
    class Bitmask {
        width: number;
        height: number;
        protected mask: Uint8Array;
        constructor(width: number, height: number);
        set(col: number, row: number): void;
        get(col: number, row: number): number;
    }
    interface IPointerEvents {
        up: string;
        down: string[];
        move: string;
        enter: string;
        leave: string;
    }
    const pointerEvents: IPointerEvents;
    interface ClientCoordinates {
        clientX: number;
        clientY: number;
    }
    function clientCoord(ev: PointerEvent | MouseEvent | TouchEvent): ClientCoordinates;
    function loadImageAsync(src: string): Promise<HTMLImageElement>;
    interface GestureTarget {
        onClick(coord: ClientCoordinates): void;
        onDragStart(coord: ClientCoordinates): void;
        onDragMove(coord: ClientCoordinates): void;
        onDragEnd(coord: ClientCoordinates): void;
    }
    class GestureState {
        protected target: GestureTarget;
        startX: number;
        startY: number;
        currentX: number;
        currentY: number;
        isDrag: boolean;
        constructor(target: GestureTarget, coord: ClientCoordinates);
        update(coord: ClientCoordinates): void;
        end(coord?: ClientCoordinates): void;
        distance(): number;
    }
    function bindGestureEvents(el: HTMLElement, target: GestureTarget): void;
}
declare module "lib/pxtextensions" {
    import * as EventEmitter from 'eventemitter3';
    export namespace pxt.extensions {
        interface ReadResponse {
            asm?: string;
            code?: string;
            json?: string;
            jres?: string;
        }
        function inIframe(): boolean;
        function setup(client: PXTClient): void;
        function init(): void;
        function read(client?: PXTClient): void;
        function readUser(): void;
        function write(code: string, json?: string): void;
        function queryPermission(): void;
        function requestPermission(serial: boolean): void;
        function dataStream(serial: boolean): void;
        function getExtensionId(): string;
    }
    export namespace pxt.extensions.ui {
        function isTouchEnabled(): boolean;
        function hasPointerEvents(): boolean;
        interface IPointerEvents {
            up: string;
            down: string[];
            move: string;
            enter: string;
            leave: string;
        }
        const pointerEvents: IPointerEvents;
        function getClientXYFromEvent(ev: MouseEvent | PointerEvent | TouchEvent): {
            clientX: number;
            clientY: number;
        };
        function useTouchEvents(): boolean;
        function usePointerEvents(): boolean;
        function useMouseEvents(): boolean;
    }
    export class PXTClient {
        private eventEmitter;
        constructor();
        on(eventName: string, listener: EventEmitter.ListenerFn): void;
        removeEventListener(eventName: string, listener: EventEmitter.ListenerFn): void;
        emit(eventName: string, payload: Object, error?: boolean): void;
        getEventEmitter(): EventEmitter<string | symbol>;
    }
}
