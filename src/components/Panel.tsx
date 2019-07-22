import * as React from 'react';

import '../css/panel.css';

interface Props {
    expandedByDefault?: boolean,
    title: string,
}

export class Panel extends React.Component<Props, { expanded: boolean }> {
    constructor(props: Props) {
        super(props);

        this.state = {
            expanded: props.expandedByDefault
        }
    }

    clickTitle = () => {
        this.setState({ expanded: !this.state.expanded });
    }

    renderPanel() {
        return this.state.expanded
            ? <div className="panel-contents">{this.props.children}</div>gi
            : null;
    }

    render() {
        return (
            <div className="toolbox-panel">
                <h3 className="panel-title" onClick={this.clickTitle}>{this.props.title}
                <i className={this.state.expanded?"panel-icon fas fa-chevron-circle-up":"panel-icon fas fa-chevron-circle-down"}></i>
                </h3>
                
                {this.renderPanel()}
            </div>
        );
    }


}