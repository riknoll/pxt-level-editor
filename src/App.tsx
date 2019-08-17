/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';
import { Provider } from 'react-redux';

import { pxt, PXTClient } from '../lib/pxtextensions';
import store from './store/store'
import { Map, MapCanvas } from './components/Map';
import { Navigator } from './components/Navigator';
import { EditingTools } from './components/EditingTools';
import { PropertyEditor } from './components/PropertyEditor';
import { Toolbox } from './components/Toolbox';
import { EmitterFactory } from "./exporter/factory";
import { MapData, Layer, MapLog } from './map';

import './css/theme.css'
import './css/index.css'
import { OperationLog } from './opLog';
import { loadExampleAsync, Project } from './project';

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    tileSetLoaded: boolean;
    target: string;
}

export class App extends React.Component<AppProps, AppState> {
    protected map: MapLog;
    protected project: Project;

    constructor(props: AppProps) {
        super(props);

        this.state = {
            target: props.target,
            tileSetLoaded: false
        };

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        loadExampleAsync("tile_dungeon")
            .then(proj => {
                this.project = proj;
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

    render() {
        if (!this.project) {
            return <div className="app"></div>
        }

        return (
            <Provider store={store}>
                <div className="app">
                    <div className="sidebar">
                        <Navigator map={this.map} project={this.project} />
                        <EditingTools />
                        <Toolbox project={this.project} />
                    </div>
                    <div className="main">
                        <Map map={this.map} activeLayer={Layer.Area} project={this.project} />
                        <PropertyEditor />
                    </div>
                </div>
            </Provider>
        );
    }
}
