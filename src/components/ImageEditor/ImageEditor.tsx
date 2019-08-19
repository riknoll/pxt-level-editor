import * as React from 'react';

import { Provider } from 'react-redux';
import store from './store/imageStore'
import { SideBar } from './SideBar';
import { BottomBar } from './BottomBar';
import { ImageCanvas } from './ImageCanvas';

import './css/imageEditor';

export class ImageEditor extends React.Component<{},{}> {
    render() {
        return <Provider store={store}>
            <div className="image-editor">
                <div className="image-editor-content">
                    <SideBar />
                    <ImageCanvas />
                </div>
                <BottomBar />
            </div>
        </Provider>
    }
}