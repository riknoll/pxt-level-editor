import * as React from 'react';
import '../css/navigator.css';

export class Navigator extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="navigator">
                Mini-map component
            </div>
        );
    }
}