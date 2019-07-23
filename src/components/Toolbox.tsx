import * as React from 'react';
import '../css/toolbox.css';
import { SpriteEditorButton } from './SpriteEditorButton';



export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    onChange = (v: string) => {
        console.log(v);
    }
    render() {
        return (
            <div className="toolbox">
                Toolbox component
                <SpriteEditorButton onChange={this.onChange} />
            </div>
        );
    }
}