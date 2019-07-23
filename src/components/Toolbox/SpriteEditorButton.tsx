/// <reference path="../../../dist/js/spriteEditor.d.ts" />

import * as React from 'react';

interface ISpriteEditorProps {
    onChange: (v: string) => void;
}

interface ISpriteEditorState {
    open: boolean;
}

export class SpriteEditorButton extends React.Component<ISpriteEditorProps, ISpriteEditorState> {
      constructor(props: ISpriteEditorProps) {
          super(props);
          this.state = {
            open: false,
          };

          this.openSpriteEditor = this.openSpriteEditor.bind(this);
      }

      renderSpriteEditor() {
          const state = pxtsprite.imageLiteralToBitmap('',  DEFAULT_SPRITE_STATE);

          const contentDiv = this.refs['spriteEditorPopup'] as HTMLDivElement;

          let spriteEditor = new pxtsprite.SpriteEditor(state, null, false);
          spriteEditor.render(contentDiv);
          spriteEditor.rePaint();
          spriteEditor.setActiveColor(1, true);
          spriteEditor.setSizePresets([
              [8, 8],
              [16, 16],
              [32, 32],
              [10, 8]
          ]);

          contentDiv.style.height = (spriteEditor.outerHeight() + 3) + "px";
          contentDiv.style.width = (spriteEditor.outerWidth() + 3) + "px";
          contentDiv.style.overflow = "hidden";
          contentDiv.className = 'sprite-editor-dropdown-bg sprite-editor-dropdown';
          spriteEditor.addKeyListeners();
          spriteEditor.onClose(() => {
              const newSpriteState = pxtsprite
                .bitmapToImageLiteral(spriteEditor.bitmap().image);
              this.setState({
                  open: false,
                });
              spriteEditor.removeKeyListeners();
              this.props.onChange(newSpriteState);
              spriteEditor = undefined;
          });
      }

      openSpriteEditor() {
          this.setState({ open: true }, this.renderSpriteEditor);
      }

      render() {
          const {open} = this.state;
          return (
              <div className='toolbox-panel-grid-tile'>
                    <div
                        role='button'
                        className={"addSpriteButton fas fa-plus"}
                        onClick={this.openSpriteEditor} id={'Add sprite'}
                    ></div>
                    {open && <div ref="spriteEditorPopup"></div>}
              </div >

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