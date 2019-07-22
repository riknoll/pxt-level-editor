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

}

interface IPropertyEditorInput {
    id: string;
    inputObject: IitemBase;
}

export class PropertyEditor extends React.Component<{}, {}> {

    constructor(props: IPropertyEditorInput) {
        super(props);
    }

    render() {
        return (
            <div className="propertyEditor">
                {this.renderEditorField()}
            </div>
        );
    }

    private closeEditor(): void {
        // TODO: 
        return;
    }

    private save(): void {
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