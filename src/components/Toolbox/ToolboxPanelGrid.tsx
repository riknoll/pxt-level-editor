import * as React from 'react';
import { SpriteEditorButton } from './SpriteEditorButton';
import SpriteSheet from './SpriteSheet';

import '../../css/toolbox-panel-grid.css';
import { ProjectSprite } from '../../project';

interface Props {
    onChange: (index: number) => void;
    selectedIndex: number;
    sprites: ProjectSprite[];
    onTileAdd: (spriteEditorValue : string) => void;
}
interface State {
    spriteEditorValue : string;
}

export class ToolboxPanelGrid extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { spriteEditorValue : DEFAULT_SPRITE_STATE};
    }

    spriteEditorOnChange = (v: string) => {
        this.setState({spriteEditorValue : v})
        this.props.onTileAdd(v);
        console.log(v);
    }

    spriteClicked = (index: number) => {
        return () => {
            this.props.onChange(index);
        }
    }

    renderTile(sprite: ProjectSprite, index: number) {
        return <div role="button"
            onClick={this.spriteClicked(index)}
            className="toolbox-panel-grid-tile"
            key={sprite.name}>
            <SpriteSheet
                selected={this.props.selectedIndex === index}
                sprite={sprite}
                finalSize={48} />
        </div>;
    }

    renderTiles() {
        return this.props.sprites.map((sprite, index) => this.renderTile(sprite, index));
    }

    render() {
        return (
            <div className="toolbar-panel-grid">
                <SpriteEditorButton onChange={this.spriteEditorOnChange} value= {this.state.spriteEditorValue} />
                {this.renderTiles()}
            </div>
        );
    }
}

const DEFAULT_SPRITE_STATE = `
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
`;