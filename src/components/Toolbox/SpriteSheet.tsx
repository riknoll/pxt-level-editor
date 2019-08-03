import * as React from 'react';
import { ProjectSprite, isSpriteSheetReference } from '../../project';

interface SpriteSheetProps {
    sprite: ProjectSprite,
    finalSize?: number;
    selected: boolean;
}

interface SpriteSheetState {
}

export default class SpriteSheet extends React.Component<SpriteSheetProps, SpriteSheetState> {
    constructor(props: SpriteSheetProps) {
        super(props);
        this.state = {};
    }

    public render() {
        const sprite = this.props.sprite;
        let i: JSX.Element;
        let width: number;
        if (isSpriteSheetReference(sprite)) {
            i =  <img
                alt={name}
                src={sprite.sheet.src}
                style={{
                    border: this.props.selected ? "solid 1px #333" : "",
                    boxSizing: "border-box",
                    width: sprite.width,
                    height: sprite.height,
                    objectFit: 'none',
                    objectPosition:`-${sprite.x}px -${sprite.y}px`,
                }}
            />;

            width = sprite.width;
        }
        else {
            i = <img
                alt={name}
                src={sprite.src}
            />;

            width = sprite.loaded.width;
        }

        return (
            <div style={{ overflow: 'visible', transform: `scale(${(this.props.finalSize / width)})`, transformOrigin: `0 0`, maxHeight: 0, }}>
                { i }
            </div>
        );
    }
}