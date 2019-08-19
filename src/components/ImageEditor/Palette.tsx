import * as React from 'react';
import { connect } from 'react-redux';
import { ImageEditorStore } from './store/imageReducer';
import { dispatchChangeSelectedColor } from './actions/dispatch';

export interface PaletteProps {
    colors: string[];
    selected: number;
    dispatchChangeSelectedColor: (index: number) => void;
}

class PaletteImpl extends React.Component<PaletteProps,{}> {
    protected handlers: (() => void)[] = [];

    render() {
        const { colors, selected } = this.props;
        const SPACER = 1;
        const HEIGHT = 10;
        const ROWS = colors.length >> 1;

        const width = 3 * SPACER + 2 * HEIGHT;

        return <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${HEIGHT * 1.5}`}>
                <g>
                    <rect
                        fill={colors[1]}
                        x={width - (SPACER << 1) - (HEIGHT * 1.5)}
                        y={SPACER << 2}
                        width={HEIGHT * 1.5}
                        height={HEIGHT}
                        stroke="#3c3c3c"
                        strokeWidth="0.5">
                    </rect>
                    <rect
                        fill={colors[selected]}
                        x={SPACER << 1}
                        y={SPACER}
                        width={HEIGHT * 1.5}
                        height={HEIGHT}
                        stroke="#3c3c3c"
                        strokeWidth="0.5">
                    </rect>
                </g>
            </svg>
            <div className="image-editor-color-buttons">
                {this.props.colors.map((color, index) =>
                    <div key={index}
                        className={`image-editor-button ${index === 0 ? "checkerboard" : ""}`}
                        role="button"
                        title={`Color ${index}`}
                        onClick={this.clickHandler(index)}
                        style={index === 0 ? null : { backgroundColor: color }} />
                )}
            </div>
        </div>;
    }

    protected clickHandler(index: number) {
        if (!this.handlers[index]) this.handlers[index] = () => this.props.dispatchChangeSelectedColor(index);

        return this.handlers[index];
    }
}

function mapStateToProps(state: ImageEditorStore) {
    if (!state) return {};
    return {
        selected: state.selectedColor,
        colors: state.colors
    };
}

const mapDispatchToProps = {
    dispatchChangeSelectedColor
};


export const Palette = connect(mapStateToProps, mapDispatchToProps)(PaletteImpl);