import * as React from 'react';
import { loadImageAsync, ClientCoordinates } from '../../util';
import { TileSet } from '../../tileset';
import { Sprite, SpriteDictionary } from '../SpriteStore';

interface SpriteSheetState {
    coords?: ClientCoordinates;
}

export default class SpriteSheet extends React.Component<Sprite, SpriteSheetState> {
    private tileSet: TileSet;

    constructor(props: Sprite) {
        super(props);
        this.state = {};

        this.loadTileSet = this.loadTileSet.bind(this);
        this.loadTileSet();

        console.log(SpriteDictionary);
    }

    private loadTileSet() {
        const { image: src, height: size, index } = this.props;

        loadImageAsync(src)
            .then((el) => {
                this.setState({ coords: new TileSet(el, size).indexToCoord(index) });
            });
    }

    public render() {
        const { image: src, name: alt, index, height: size, finalSize } = this.props;
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