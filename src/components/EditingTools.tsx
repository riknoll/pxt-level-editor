import * as React from 'react';
import '../css/editingTools.css';
import { EditButton } from './EditButton';

export class EditingTools extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="editingTools">
                
                <EditButton className="fas fa-mouse-pointer" onClick={() => { console.log("pointer button clicked"); }} id="pointer" />
                <EditButton className="fas fa-pencil-alt" onClick={() => { console.log("pencil button clicked"); }} id="pencil" />
                <EditButton className="fas fa-eraser" onClick={() => { console.log("erase button clicked"); }} id="erase" />
             
                

            </div>
           
        );
    }
}