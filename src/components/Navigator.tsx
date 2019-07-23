import * as React from 'react';
import '../css/navigator.css';
import { GestureTarget, ClientCoordinates, bindGestureEvents } from '../util';
import { MapData } from '../map';
import { TileSet } from '../tileset';

interface NavigatorProps {
    map: MapData
    tileSet: TileSet
}

export class Navigator extends React.Component<NavigatorProps, {}> {
    protected workspace: NavigatorCanvas;

    constructor(props: NavigatorProps) {
        super(props);
    }

    render() {
        return (
            <div className="navigator">
                <canvas width="1" height="1" ref={this.handleCanvasRef}/>
            </div>
        );
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    componentWillReceiveProps(props: NavigatorProps) {
        this.workspace.setTileSet(props.tileSet);
    }

    handleResize = () => {
        this.workspace.redraw();
    };

    handleCanvasRef = (ref: HTMLCanvasElement) => {
        if (ref) this.workspace = new NavigatorCanvas(ref, this.props.map, this.props.tileSet);
    }
}


export class NavigatorCanvas implements GestureTarget {
    protected context: CanvasRenderingContext2D;

    constructor(protected canvas: HTMLCanvasElement, protected map: MapData, protected tileSet: TileSet) {
        this.context = canvas.getContext("2d");

        bindGestureEvents(canvas, this);
        this.map.onChange(() => this.redraw());
    }

    setTileSet(tiles:TileSet){
        this.tileSet=tiles;
        this.redraw();
    }


    redraw() {
        window.requestAnimationFrame(() => {
            let mapBounds = this.map.getBounds();

            if(!mapBounds) return;

            let mapWidth = mapBounds.right - mapBounds.left + 1;
            let mapHeight = mapBounds.bottom - mapBounds.top + 1;

            // Compute the minimum integer scaling to try to fit the map
            let scale = Math.min(
                Math.floor(this.canvas.parentElement.clientWidth / mapWidth),
                Math.floor(this.canvas.parentElement.clientHeight / mapHeight),
                16  // Minimum tile size
            );

            this.canvas.width = mapWidth * scale;
            this.canvas.height = mapHeight * scale;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            

            for (let x = 0; x < mapWidth; x++) {
                for (let y = 0; y < mapHeight; y++) {
                    let tile_index = this.map.getTile(
                        mapBounds.left + x, mapBounds.top + y);

                    if (!tile_index) {
                        continue
                    }
                    
                    let rgb = this.tileSet.getColor(tile_index).split(' ');
                    
                    let r = parseInt(rgb[0]); // Random colors
                    let g = parseInt(rgb[1]);
                    let b = parseInt(rgb[2]);

                    this.context.fillStyle = "rgba("
                        + r + "," + g + "," + b + ", 255)";
                    this.context.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        });
    }

    onClick(coord: ClientCoordinates) {};
    onDragStart(coord: ClientCoordinates) {};
    onDragMove(coord: ClientCoordinates) {};
    onDragEnd(coord: ClientCoordinates) {};
}
