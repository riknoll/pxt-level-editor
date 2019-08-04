import * as React from 'react';
import '../css/propertyEditor.css';

import { PropertyEditorInput } from './PropertyEditorInput';
import { MapObject } from '../map';

interface IPropertyEditorProps {
    object: MapObject;
    showPropertyEditor: (show: boolean, obj?: MapObject) => void;
}

interface IPropertyEditorState {
    fields: {[key: string]: string};
}

export class PropertyEditor extends React.Component<IPropertyEditorProps, IPropertyEditorState> {
    protected newProperty: HTMLInputElement;

    constructor(props: IPropertyEditorProps) {
        super(props);

        this.state = { fields: Object.assign({}, props.object.properties) };
    }

    protected setProp = (name: string, value?: string): void => {
        this.setState({
            fields: {
                ...this.state.fields,
                [name]: value || null
            }
        });
    }

    protected deleteProp = (name: string): void => {
        const fields = Object.assign({}, this.state.fields);
        delete fields[name];
        this.setState({ fields: fields });
    }

    protected handleAddProp = (evt: any): void => {
        if (this.newProperty.value) {
            this.setProp(this.newProperty.value);
            this.newProperty.value = null;
        }
    }

    protected handleSave = (): void => {
        // remove deleted properties
        Object.keys(this.props.object.properties).map((p) => {
            if (!this.state.fields[p]) delete this.props.object.properties[p];
        });

        // update remaining
        Object.keys(this.state.fields).map((f) => {
            this.props.object.setProp(f, this.state.fields[f]);
        })
        this.handleClose();
    }

    protected handleClose = (): void => {
        this.props.showPropertyEditor(false);
    }

    render() {
        return (
            <div className="propertyEditor">
                {Object.keys(this.state.fields).map((f, i) =>
                    <PropertyEditorInput key={i} name={f} value={this.state.fields[f]} onBlur={this.setProp} onDelete={this.deleteProp} />
                )}
                <div className="propertyEditorInput newProperty">
                    <input type="text" placeholder="Property name" ref={(el) => this.newProperty = el} />
                    <div onClick={this.handleAddProp}>Add</div>
                </div>
                <div className="actions">
                    <div onClick={this.handleClose}>Close</div>
                    <div onClick={this.handleSave}>Save</div>
                </div>
            </div>
        );
    }
}