import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../css/propertyEditor.css';
import { PropertyEditorField } from './PropertyEditorField';
import { PositionProperty } from 'csstype';

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
        this.state = {
            shouldRender: true,
        };
        this.closeEditor = this.closeEditor.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    render() {
        if (this.state.shouldRender) {
            return (
                <div className="propertyEditor">
                    {this.renderCloseButton()}
                    {this.renderEditorFields()}
                    {this.renderSaveButton()}
                </div>);
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

    private renderEditorFields(): JSX.Element {
        // TODO:
        // const fields = Object.keys(this.props.inputObject).map(key =>
        //     <PropertyEditorField label={key} value={this.props.inputObject[key] as string} type="text" />
        // );
        return (
            <PropertyEditorField id="field-1" label={"name"} value={this.props.inputObject.name as string} type="text" />
            // <PropertyEditorField id="field-2" label={"value"} value={this.props.inputObject.value as string} type="text" />
        );
    }
}