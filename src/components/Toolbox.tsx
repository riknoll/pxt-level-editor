import * as React from 'react';
import '../css/toolbox.css';

export class Toolbox extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="toolbox">
                Toolbox component
            </div>
        );
    }
}