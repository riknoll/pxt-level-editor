import * as React from 'react';

interface IPropertyEditorFieldInput extends React.AllHTMLAttributes<{}> {
    label: string;

    value: string;

    type: string;

    placeHolder?: string;

    suffix?: string

    required?: boolean;

    // selections?: number[] | string[];
}

export class PropertyEditorField extends React.Component<{}, {}> {
    private _label: string;
    private _value: any;

    constructor(props: IPropertyEditorFieldInput) {
        super(props);
        this._label = props.label;
        this._value = props.value || props.placeHolder;
    }

    public get value(): number | string {
        // TODO: return type shuld be better defined.
        return this._value;
    }

    render() {
        // TODO: implement the input box
        return (
            <div className="propertyEditorField">
                {this._label}: <input></input>
            </div>
        );
    }
}
