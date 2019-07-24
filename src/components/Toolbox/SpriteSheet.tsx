import * as React from 'react';
import { loadImageAsync, ClientCoordinates } from '../../util';
import { TileSet } from '../../tileset';
import { Sprite } from '../SpriteStore';

interface SpriteSheetProps {
    Sprite: Sprite,
    finalSize?: number;
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
        const { image, height, index } = this.props.Sprite;

        loadImageAsync(image)
            .then((el) => {
                this.setState({ coords: new TileSet(el, height).indexToCoord(index) });
            });
    }

    public render() {
        const { image, name, index, height, width } = this.props.Sprite;
        const { coords } = this.state;

        return (
            <div style={{ overflow: 'hidden', transform: `scale(${(this.props.finalSize / width)})`, transformOrigin: `0 0`, }}>
                <img
                    alt={name || `tile-${index}`}
                    src={image}
                    style={{
                        width: width,
                        height: height,
                        objectFit: 'none',
                        objectPosition: coords && `-${coords.clientX}px -${coords.clientY}px`,
                    }}
                />
            </div>
        );
    }
}