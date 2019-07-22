import * as React from 'react';
import '../css/propertyEditor.css';
import { PropertyEditorField } from './PropertyEditorField';

interface IitemBase {
    /**
     * Name of the Object
     */
    name: string;

    /**
     * option value field
     */
    value?: number;

    /**
     * key value pair for rest properties
     */
    [properties: string]: number | string;
}

interface IPropertyEditorInput {
    id: string;
    inputObject: IitemBase;
}

/**
 * Defines Property Editor State
 */
interface IPropertyEditorState {
    // indicate if Property Editor should be rendered.
    shouldRender: boolean;
}

export class PropertyEditor extends React.Component<IPropertyEditorInput, IPropertyEditorState> {

    constructor(props: IPropertyEditorInput) {
        super(props);
        this.state = {shouldRender: true};
        this.closeEditor = this.closeEditor.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    render() {
        if (this.state.shouldRender) {
            return (
                <div className="propertyEditor">
                    {this.renderCloseButton()}
                    {this.renderEditorField()}
                    {this.renderSaveButton()}
                </div>
            );
        }

    }

    /**
     * renders the close button
     */
    private renderCloseButton(): JSX.Element {
        return (<button onClick={this.closeEditor}>Close</button>);
    }

    /**
     * close Property Editor
     */
    private closeEditor(): void {
        this.setState({shouldRender: false});
        return;
    }

    /**
     * render Save Changes button
     */
    private renderSaveButton(): JSX.Element {
        return (<button onClick={this.saveChanges}>Save</button>);
    }

    private saveChanges(): void {
        // TODO:
        return;
    }

    private renderEditorField(): JSX.Element {
        // TODO:
        return (
            <PropertyEditorField />
        )
    }
}