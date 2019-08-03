import * as React from 'react';
import '../css/navigator.css';
import { GestureTarget, ClientCoordinates, bindGestureEvents } from '../util';
import { MapRect, MapLog } from '../map';
import { Project } from '../project';

interface NavigatorProps {
    map: MapLog;
    project: Project;
    viewport: MapRect;
}

interface NavigatorState {
    width: number,
    height: number,
    scale: number
}

export class Navigator extends React.Component<NavigatorProps, NavigatorState> {
    protected workspace: NavigatorCanvas;
    protected canvasRef: HTMLCanvasElement;

    constructor(props: NavigatorProps) {
        super(props);

        this.state = { width: 0, height: 0, scale: 1 }
    }

    render() {
        return (
            <div className="navigator">
                <div className="mask" style={this.setMaskStyle()}>
                    {this.state.width > 0 && <div className="viewport" style={this.setViewportStyle()}></div>}
                </div>
                <canvas width={this.state.width} height={this.state.height} ref={(el) => {this.canvasRef = el;}}/>
            </div>
        );
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        this.setWorkspace();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    componentWillReceiveProps(props: NavigatorProps) {
        if (!this.workspace) return;
        if (props.project != this.props.project) this.workspace.setProject(props.project);
    }

    protected setMaskStyle() {
        return {
            width: this.state.width + "px",
            height: this.state.height + "px"
        }
    }

    protected setViewportStyle() {
        if (!this.props.viewport) return;

        let viewport = this.props.viewport;
        let s = this.state.scale;

        let top = Math.max(0, viewport.top);
        let left = Math.max(0, viewport.left);
        let width = Math.min(viewport.width - (left - viewport.left), this.state.width/s - left);
        let height = Math.min(viewport.height -  (top - viewport.top), this.state.height/s - top);

        return {
            top: top * s + "px",
            left: left * s + "px",
            width: width * s + "px",
            height: height * s + "px"
        }
    }

    protected setCanvasSize(w: number, h: number, s: number) {
        this.setState({ width: w, height: h, scale: s });
    }

    protected handleResize = () => {
        if (!this.workspace) return;
        this.workspace.redraw();
    };

    protected setWorkspace() {
        if (this.canvasRef) {
            this.workspace = new NavigatorCanvas(this.canvasRef, this.props.map, this.props.project);
            this.workspace.setResizeCallabck(this.setCanvasSize.bind(this));
        }
    }
}

export class NavigatorCanvas implements GestureTarget {
    protected context: CanvasRenderingContext2D;
    protected setCanvasSize: (w: number, h: number, s: number) => void;

    constructor(protected canvas: HTMLCanvasElement, protected log: MapLog, protected project: Project) {
        this.context = canvas.getContext("2d");

        bindGestureEvents(canvas, this);
        this.log.addChangeListener(() => this.redraw());
    }

    map() {
        return this.log.currentState()
    }

    setProject(proj: Project) {
        this.project = proj;
        this.redraw();
    }

    setResizeCallabck(cb: any) {
        this.setCanvasSize = cb;
    }

    redraw() {
        window.requestAnimationFrame(() => {
            let mapBounds = this.map().getBounds();

            if (!mapBounds) return;

            let mapWidth = mapBounds.right - mapBounds.left + 1;
            let mapHeight = mapBounds.bottom - mapBounds.top + 1;

            // Compute the minimum integer scaling to try to fit the map
            let scale = Math.min(
                Math.floor(this.canvas.parentElement.clientWidth / mapWidth),
                Math.floor(this.canvas.parentElement.clientHeight / mapHeight),
                16  // Minimum tile size
            );

            let w = mapWidth * scale;
            let h = mapHeight * scale;
            this.setCanvasSize(w, h, scale);


            for (let x = 0; x < mapWidth; x++) {
                for (let y = 0; y < mapHeight; y++) {
                    let tile_index = this.map().getTile(
                        mapBounds.left + x, mapBounds.top + y);

                    if (tile_index == null || tile_index === -1) {
                        continue
                    }

                    let tileColor = this.project.getColor(tile_index);

                    this.context.fillStyle = "rgba("
                        + tileColor.r + ","
                        + tileColor.g + ","
                        + tileColor.b + ", 255)";
                    this.context.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        });
    }

    onClick(coord: ClientCoordinates) { };
    onDragStart(coord: ClientCoordinates) { };
    onDragMove(coord: ClientCoordinates) { };
    onDragEnd(coord: ClientCoordinates) { };
}
