import * as React from 'react';
import { loadImageAsync, ClientCoordinates } from '../../util';
import { TileSet } from '../../tileset';

interface SpriteSheetProps {
    src: string;
    index: number;
    size?: number;
    finalSize: number;
    alt?: string;
}

interface SpriteSheetState {
    coords?: ClientCoordinates;
}

export default class SpriteSheet extends React.Component<SpriteSheetProps, SpriteSheetState> {
    private tileSet: TileSet;

    constructor(props: SpriteSheetProps) {
        super(props);
        this.state = {};

        this.loadTileSet = this.loadTileSet.bind(this);
        this.loadTileSet();
    }

    private loadTileSet() {
        const { src, size, index } = this.props;

        loadImageAsync(src)
            .then((el) => {
                this.setState({ coords: new TileSet(el, size).indexToCoord(index) });
            });
    }

    public render() {
        const { src, alt, index, size, finalSize } = this.props;
        const { coords } = this.state;

        return (
            <div style={{ overflow: 'hidden', transform: `scale(${(finalSize / size)})`, transformOrigin: `0, 0`, }}>
                <img
                    alt={alt || `tile-${index}`}
                    src={src}
                    style={{
                        width: size,
                        height: size,
                        objectFit: 'none',
                        objectPosition: coords && `-${coords.clientX}px -${coords.clientY}px`,
                    }}
                />
            </div>
        );
    }
}