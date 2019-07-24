/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';

import { pxt, PXTClient } from '../lib/pxtextensions';
import { Map, MapCanvas } from './components/Map';
import { Navigator } from './components/Navigator';
import { EditingTools } from './components/EditingTools';
import { Toolbox } from './components/Toolbox';
import { EmitterFactory } from "./exporter/factory";
import { MapData, MapRect, MapObjectLayers, MapLog, ReadonlyMapData } from './map';
import { MapTools, loadImageAsync } from './util';
import { TileSet, TILE_SIZE } from './tileset';
import { Tile } from './components/Toolbox/toolboxTypes';

import './css/index.css'
import { OperationLog } from './opLog';

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    tileSelected?: Tile;
    tileSetLoaded: boolean;
    target: string;
    tool: MapTools;
    visibleRect: MapRect;
}

export class App extends React.Component<AppProps, AppState> {

    protected map: MapLog;
    protected tileSet: TileSet;
    constructor(props: AppProps) {
        super(props);

        this.state = {
            target: props.target,
            tool: MapTools.Stamp,
            tileSetLoaded: false,
            visibleRect: null
        };

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        loadImageAsync("./tile.png")
            .then(el => {
                this.tileSet = new TileSet(el, TILE_SIZE);
                this.setState({ tileSetLoaded: true })
            });

        this.map = new OperationLog(() => new MapData(), MapCanvas.applyOperation);

        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp && resp.json && resp.json.length > 0) {
            const code = resp.code;
            const json = JSON.parse(resp.json);
            console.log('reading code and json', code, json);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project [extension_name].ts and [extension_name].json
        console.log("write code and json");

        const { target } = this.state;
        const emitter = EmitterFactory.getEmitter(target);
        if (!emitter) return;

        const code = emitter.output(undefined);
        const json = {};
        pxt.extensions.write(code, JSON.stringify(json));
    }

    private onTileChange = (tile: Tile) => {
        this.setState({ tileSelected: tile });
    }

    protected setVisibleRect(rect: MapRect) {
        this.setState({ visibleRect: rect });
    }

    render() {
        const { target } = this.state;
        return (
            <div className="app">
                <div className="sidebar">
                    <Navigator map={this.map} tileSet={this.tileSet} viewport={this.state.visibleRect} />
                    <EditingTools onToolSelected={tool => this.setState({ tool })} selected={this.state.tool} />
                    <Toolbox onChange={this.onTileChange} />
                </div>
                <div className="main">
                    <Map tileSelected={this.state.tileSelected} tool={this.state.tool} map={this.map} activeLayer={MapObjectLayers.Area} tileSet={this.tileSet} onRectChange={this.setVisibleRect.bind(this)} />
                </div>
            </div>
        );
    }
}
