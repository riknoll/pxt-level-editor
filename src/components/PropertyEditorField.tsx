import * as React from 'react';

interface IPropertyEditorFieldInput extends React.AllHTMLAttributes<{}> {
    Label: string;

    PlaceHolder?: string;

    Suffix?: string

    Required?: boolean;

    Selections?: number[] | string[];
}

export class PropertyEditorField extends React.Component<{}, {}> {
    private _label: string;
    private _value: any;

    constructor(props: IPropertyEditorFieldInput) {
        super(props);
        this._label = props.Label;

    }

    public get value(): number | string {
        return this._value;
    }

    render() {
        // TODO: implement the input box
        return (
            <div className="propertyEditorField">
                <p>{this._label}</p>
                <input></input>
            </div>
        );
    }
}
