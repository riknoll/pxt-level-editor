import * as React from 'react';

import '../../css/toolbox-panel.css';

interface Props {
    onTitleClick: () => void;
    expanded: boolean;
    showHeader: boolean;
    title: string;
}

export class ToolboxPanel extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    renderPanel() {
        return <div className={`panel-contents collapsible ${this.props.expanded ? "" : "collapsed"}`}>
            {this.props.children}
        </div>;
    }

    render() {
        const { expanded, showHeader } = this.props;
        return (
            <div className={`toolbox-panel collapsible ${(expanded || showHeader) ? "" : "collapsed"} ${expanded ? "expanded" : ""}`}>
                <h3 className="panel-title toolbox-title" onClick={this.props.onTitleClick}>{this.props.title}
                    <i className={this.props.expanded ? "panel-icon fas fa-chevron-up" : "panel-icon fas fa-chevron-down"}></i>
                </h3>

                {this.renderPanel()}
            </div>
        );
    }
}