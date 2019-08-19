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

        return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${ROWS * (SPACER + HEIGHT) + HEIGHT * 1.5}`}>
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
            <g transform={`translate(0 ${HEIGHT * 1.5})`}>
                {this.props.colors.map((color, index) =>
                    <g key={index}>
                        <rect
                            fill={color}
                            x={SPACER + (index % 2) * (SPACER + HEIGHT)}
                            y={SPACER + (index >> 1) * (SPACER + HEIGHT)}
                            width={HEIGHT}
                            height={HEIGHT}
                            rx="1.5"
                            ry="1.5"
                            onClick={this.clickHandler(index)}>
                        </rect>
                    </g>
                )}
            </g>
        </svg>;
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