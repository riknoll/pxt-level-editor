import * as React from 'react';
import '../css/editButton.css';

interface EditButtonProps {
    className: string;  //utilizes the class name for icon as defined at font awesome
    onClick: (evt?: any) => void;
    id: string
}




export class EditButton extends React.Component<EditButtonProps, {}> {

    constructor(props: EditButtonProps) {
        super(props);
        
    }

    render() {
        return (
            <div className={"editButton " + this.props.className} onClick={this.props.onClick} id={this.props.id}>
            </div>
        );
    }
}