/// <reference path="../../../dist/js/spriteEditor.d.ts" />

import * as React from 'react';
import { pxt } from 'lib/pxtextensions';

interface ISpriteEditorProps {
    onChange: (v: string) => void;
    value: string;
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

      stripImageLiteralTags(imageLiteral: string) {
        const imgTag = `img\``;
        const endQuote = `\``;
        if (imageLiteral.includes(imgTag)) {
            return imageLiteral
                .replace(imgTag, '')
                .replace(endQuote, '')
        }

        return imageLiteral;
      }

      renderSpriteEditor() {
          const { value } = this.props;
          const stateSprite = value && this.stripImageLiteralTags(value)
          const state = pxtsprite.imageLiteralToBitmap('',  stateSprite || DEFAULT_SPRITE_STATE);

          const contentDiv = this.refs['spriteEditorContainer'] as HTMLDivElement;

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
          contentDiv.className = 'sprite-editor-container sprite-editor-dropdown-bg sprite-editor-dropdown';
          spriteEditor.addKeyListeners();
          spriteEditor.onClose(() => {
                this.props.onChange(toImageURI(spriteEditor.bitmap().image));
                this.setState({
                    open: false,
                });
                spriteEditor.removeKeyListeners();
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
                        className={"circle-button fas fa-plus"}
                        onClick={this.openSpriteEditor} id={'Add sprite'}
                    ></div>
                    {open && <div ref="spriteEditorContainer"></div>}
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

function toImageURI(bitmap: pxtsprite.Bitmap) {
    const colors = [
        "#ffffff",
        "#ff2121",
        "#ff93c4",
        "#ff8135",
        "#fff609",
        "#249ca3",
        "#78dc52",
        "#003fad",
        "#87f2ff",
        "#8e2ec4",
        "#a4839f",
        "#5c406c",
        "#e5cdc4",
        "#91463d",
        "#000000"
    ]
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    let context: CanvasRenderingContext2D;
    context = canvas.getContext("2d");

    for (let x = 0; x < bitmap.width; x++) {
        for (let y = 0; y < bitmap.height; y++) {
            if (bitmap.get(x, y)) {
                context.fillStyle = colors[bitmap.get(x, y)];
                context.fillRect(x, y, 1, 1);
            }
        }
    }

    return canvas.toDataURL();
}