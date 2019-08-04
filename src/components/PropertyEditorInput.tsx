import * as React from 'react';
import '../css/propertyEditorInput.css';

interface IPropertyEditorInputProps {
    name: string;
    value: string;
    placeholder?: string;
    onBlur?: (name: string, value: string) => void;
    onDelete?: (name: string) => void;
}

export class PropertyEditorInput extends React.Component<IPropertyEditorInputProps, {}> {
    constructor(props: IPropertyEditorInputProps) {
        super(props);
    }

    protected handleOnBlur = (evt: any) => {
        if (this.props.onBlur) {
            this.props.onBlur(this.props.name, evt.target.value);
        }
    }

    protected handleOnDelete = () => {
        if (this.props.onDelete) {
            this.props.onDelete(this.props.name);
        }
    }

    render() {
        let props = this.props;
        return (
            <div className="inputContainer">
                <div className="propertyEditorInput">
                    <label htmlFor={props.name}>{props.name}</label>
                    <input type="text" name={props.name} defaultValue={props.value} placeholder={props.placeholder} onBlur={this.handleOnBlur} />
                </div>
                <i className="fas fa-times" onClick={this.handleOnDelete} />
            </div>
        );
    }
}