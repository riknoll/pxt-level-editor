var pxtsprite;
(function (pxtsprite) {
    const hexChars = [".", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    class Bitmap {
        constructor(width, height, x0 = 0, y0 = 0) {
            this.width = width;
            this.height = height;
            this.x0 = x0;
            this.y0 = y0;
            this.buf = new Uint8Array(Math.ceil(width * height / 2));
        }
        set(col, row, value) {
            if (col < this.width && row < this.height && col >= 0 && row >= 0) {
                const index = this.coordToIndex(col, row);
                this.setCore(index, value);
            }
        }
        get(col, row) {
            if (col < this.width && row < this.height && col >= 0 && row >= 0) {
                const index = this.coordToIndex(col, row);
                return this.getCore(index);
            }
            return 0;
        }
        copy(col = 0, row = 0, width = this.width, height = this.height) {
            const sub = new Bitmap(width, height);
            sub.x0 = col;
            sub.y0 = row;
            for (let c = 0; c < width; c++) {
                for (let r = 0; r < height; r++) {
                    sub.set(c, r, this.get(col + c, row + r));
                }
            }
            return sub;
        }
        apply(change, transparent = false) {
            let current;
            for (let c = 0; c < change.width; c++) {
                for (let r = 0; r < change.height; r++) {
                    current = change.get(c, r);
                    if (!current && transparent)
                        continue;
                    this.set(change.x0 + c, change.y0 + r, current);
                }
            }
        }
        equals(other) {
            if (this.width === other.width && this.height === other.height && this.x0 === other.x0 && this.y0 === other.y0 && this.buf.length === other.buf.length) {
                for (let i = 0; i < this.buf.length; i++) {
                    if (this.buf[i] !== other.buf[i])
                        return false;
                }
                return true;
            }
            return false;
        }
        coordToIndex(col, row) {
            return col + row * this.width;
        }
        getCore(index) {
            const cell = Math.floor(index / 2);
            if (index % 2 === 0) {
                return this.buf[cell] & 0xf;
            }
            else {
                return (this.buf[cell] & 0xf0) >> 4;
            }
        }
        setCore(index, value) {
            const cell = Math.floor(index / 2);
            if (index % 2 === 0) {
                this.buf[cell] = (this.buf[cell] & 0xf0) | (value & 0xf);
            }
            else {
                this.buf[cell] = (this.buf[cell] & 0x0f) | ((value & 0xf) << 4);
            }
        }
    }
    pxtsprite.Bitmap = Bitmap;
    class Bitmask {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.mask = new Uint8Array(Math.ceil(width * height / 8));
        }
        set(col, row) {
            const cellIndex = col + this.width * row;
            const index = cellIndex >> 3;
            const offset = cellIndex & 7;
            this.mask[index] |= (1 << offset);
        }
        get(col, row) {
            const cellIndex = col + this.width * row;
            const index = cellIndex >> 3;
            const offset = cellIndex & 7;
            return (this.mask[index] >> offset) & 1;
        }
    }
    pxtsprite.Bitmask = Bitmask;
    function resizeBitmap(img, width, height) {
        const result = new Bitmap(width, height);
        result.apply(img);
        return result;
    }
    pxtsprite.resizeBitmap = resizeBitmap;
    function imageLiteralToBitmap(text, defaultPattern) {
        text = text.replace(/[ `]|(?:&#96;)|(?:&#9;)|(?:img)/g, "").trim();
        text = text.replace(/^["`\(\)]*/, '').replace(/["`\(\)]*$/, '');
        text = text.replace(/&#10;/g, "\n");
        if (!text && defaultPattern)
            text = defaultPattern;
        const rows = text.split("\n");
        const sprite = [];
        let spriteWidth = 0;
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const rowValues = [];
            for (let c = 0; c < row.length; c++) {
                switch (row[c]) {
                    case "0":
                    case ".":
                        rowValues.push(0);
                        break;
                    case "1":
                    case "#":
                        rowValues.push(1);
                        break;
                    case "2":
                    case "T":
                        rowValues.push(2);
                        break;
                    case "3":
                    case "t":
                        rowValues.push(3);
                        break;
                    case "4":
                    case "N":
                        rowValues.push(4);
                        break;
                    case "5":
                    case "n":
                        rowValues.push(5);
                        break;
                    case "6":
                    case "G":
                        rowValues.push(6);
                        break;
                    case "7":
                    case "g":
                        rowValues.push(7);
                        break;
                    case "8":
                        rowValues.push(8);
                        break;
                    case "9":
                        rowValues.push(9);
                        break;
                    case "a":
                    case "A":
                    case "R":
                        rowValues.push(10);
                        break;
                    case "b":
                    case "B":
                    case "P":
                        rowValues.push(11);
                        break;
                    case "c":
                    case "C":
                    case "p":
                        rowValues.push(12);
                        break;
                    case "d":
                    case "D":
                    case "O":
                        rowValues.push(13);
                        break;
                    case "e":
                    case "E":
                    case "Y":
                        rowValues.push(14);
                        break;
                    case "f":
                    case "F":
                    case "W":
                        rowValues.push(15);
                        break;
                }
            }
            if (rowValues.length) {
                sprite.push(rowValues);
                spriteWidth = Math.max(spriteWidth, rowValues.length);
            }
        }
        const spriteHeight = sprite.length;
        const result = new pxtsprite.Bitmap(spriteWidth, spriteHeight);
        for (let r = 0; r < spriteHeight; r++) {
            const row = sprite[r];
            for (let c = 0; c < spriteWidth; c++) {
                if (c < row.length) {
                    result.set(c, r, row[c]);
                }
                else {
                    result.set(c, r, 0);
                }
            }
        }
        return result;
    }
    pxtsprite.imageLiteralToBitmap = imageLiteralToBitmap;
    function bitmapToImageLiteral(bitmap) {
        let res = "img`";
        if (bitmap) {
            for (let r = 0; r < bitmap.height; r++) {
                res += "\n";
                for (let c = 0; c < bitmap.width; c++) {
                    res += hexChars[bitmap.get(c, r)] + " ";
                }
            }
        }
        res += "\n";
        res += "`";
        return res;
    }
    pxtsprite.bitmapToImageLiteral = bitmapToImageLiteral;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    const TOGGLE_WIDTH = 200;
    const TOGGLE_HEIGHT = 40;
    const TOGGLE_BORDER_WIDTH = 2;
    const TOGGLE_CORNER_RADIUS = 4;
    const BUTTON_CORNER_RADIUS = 2;
    const BUTTON_BORDER_WIDTH = 1;
    const BUTTON_BOTTOM_BORDER_WIDTH = 2;
    class Toggle {
        constructor(parent, props) {
            this.props = defaultColors(props);
            this.root = parent.group();
            this.buildDom();
            this.isLeft = true;
        }
        buildDom() {
            this.root.style().content(`
            .toggle-left {
                transform: translateX(0px);
                animation: mvleft 0.2s 0s ease;
            }

            .toggle-right {
                transform: translateX(100px);
                animation: mvright 0.2s 0s ease;
            }

            @keyframes mvright {
                0% {
                    transform: translateX(0px);
                }
                100% {
                    transform: translateX(100px);
                }
            }

            @keyframes mvleft {
                0% {
                    transform: translateX(100px);
                }
                100% {
                    transform: translateX(0px);
                }
            }
            `);
            const clip = this.root.def().create("clipPath", "sprite-editor-toggle-border")
                .clipPathUnits(true);
            clip.draw("rect")
                .at(0, 0)
                .corners(TOGGLE_CORNER_RADIUS / TOGGLE_WIDTH, TOGGLE_CORNER_RADIUS / TOGGLE_HEIGHT)
                .size(1, 1);
            this.root.draw("rect")
                .size(TOGGLE_WIDTH, TOGGLE_HEIGHT)
                .fill(this.props.baseColor)
                .stroke(this.props.borderColor, TOGGLE_BORDER_WIDTH * 2)
                .corners(TOGGLE_CORNER_RADIUS, TOGGLE_CORNER_RADIUS)
                .clipPath("url(#sprite-editor-toggle-border)");
            this.root.draw("rect")
                .at(TOGGLE_BORDER_WIDTH, TOGGLE_BORDER_WIDTH)
                .size(TOGGLE_WIDTH - TOGGLE_BORDER_WIDTH * 2, TOGGLE_HEIGHT - TOGGLE_BORDER_WIDTH * 2)
                .fill(this.props.backgroundColor)
                .corners(TOGGLE_CORNER_RADIUS, TOGGLE_CORNER_RADIUS);
            this.switch = this.root.draw("rect")
                .at(TOGGLE_BORDER_WIDTH, TOGGLE_BORDER_WIDTH)
                .size((TOGGLE_WIDTH - TOGGLE_BORDER_WIDTH * 2) / 2, TOGGLE_HEIGHT - TOGGLE_BORDER_WIDTH * 2)
                .fill(this.props.switchColor)
                .corners(TOGGLE_CORNER_RADIUS, TOGGLE_CORNER_RADIUS);
            this.leftElement = this.root.group();
            this.leftText = mkText(this.props.leftText)
                .appendClass("sprite-editor-text")
                .fill(this.props.selectedTextColor);
            this.leftElement.appendChild(this.leftText);
            this.rightElement = this.root.group();
            this.rightText = mkText(this.props.rightText)
                .appendClass("sprite-editor-text")
                .fill(this.props.unselectedTextColor);
            this.rightElement.appendChild(this.rightText);
            this.root.onClick(() => this.toggle());
        }
        toggle(quiet = false) {
            if (this.isLeft) {
                this.switch.removeClass("toggle-left");
                this.switch.appendClass("toggle-right");
                this.leftText.fill(this.props.unselectedTextColor);
                this.rightText.fill(this.props.selectedTextColor);
            }
            else {
                this.switch.removeClass("toggle-right");
                this.switch.appendClass("toggle-left");
                this.leftText.fill(this.props.selectedTextColor);
                this.rightText.fill(this.props.unselectedTextColor);
            }
            this.isLeft = !this.isLeft;
            if (!quiet && this.changeHandler) {
                this.changeHandler(this.isLeft);
            }
        }
        onStateChange(handler) {
            this.changeHandler = handler;
        }
        layout() {
            const centerOffset = (TOGGLE_WIDTH - TOGGLE_BORDER_WIDTH * 2) / 4;
            this.leftText.moveTo(centerOffset + TOGGLE_BORDER_WIDTH, TOGGLE_HEIGHT / 2);
            this.rightText.moveTo(TOGGLE_WIDTH - TOGGLE_BORDER_WIDTH - centerOffset, TOGGLE_HEIGHT / 2);
        }
        translate(x, y) {
            this.root.translate(x, y);
        }
        height() {
            return TOGGLE_HEIGHT;
        }
        width() {
            return TOGGLE_WIDTH;
        }
    }
    pxtsprite.Toggle = Toggle;
    class Button {
        constructor(root, cx, cy) {
            this.root = root;
            this.cx = cx;
            this.cy = cy;
            this.root.onClick(() => this.clickHandler && this.clickHandler());
            this.root.appendClass("sprite-editor-button");
        }
        getElement() {
            return this.root;
        }
        addClass(className) {
            this.root.appendClass(className);
        }
        removeClass(className) {
            this.root.removeClass(className);
        }
        onClick(clickHandler) {
            this.clickHandler = clickHandler;
        }
        translate(x, y) {
            this.root.translate(x, y);
        }
        title(text) {
            this._title = text;
            this.setRootTitle();
        }
        shortcut(text) {
            this._shortcut = text;
            this.setRootTitle();
        }
        setRootTitle() {
            this.root.title(this._title + (this._shortcut ? " (" + this._shortcut + ")" : ""));
        }
        setDisabled(disabled) {
            this.editClass("disabled", disabled);
        }
        setSelected(selected) {
            this.editClass("selected", selected);
        }
        layout() { }
        editClass(className, add) {
            if (add) {
                this.root.appendClass(className);
            }
            else {
                this.root.removeClass(className);
            }
        }
    }
    pxtsprite.Button = Button;
    class TextButton extends Button {
        constructor(button, text, className) {
            super(button.root, button.cx, button.cy);
            this.textEl = mkText(text)
                .appendClass(className);
            this.textEl.moveTo(this.cx, this.cy);
            this.root.appendChild(this.textEl);
        }
        setText(text) {
            this.textEl.text(text);
            this.textEl.moveTo(this.cx, this.cy);
        }
        getComputedTextLength() {
            try {
                return this.textEl.el.getComputedTextLength();
            }
            catch (e) {
                return this.textEl.el.textContent.length * 8;
            }
        }
    }
    pxtsprite.TextButton = TextButton;
    class StandaloneTextButton extends TextButton {
        constructor(text, height) {
            super(drawSingleButton(65, height), text, "sprite-editor-text");
            this.height = height;
            this.padding = 30;
            this.addClass("sprite-editor-label");
        }
        layout() {
            const newBG = drawSingleButton(this.width(), this.height);
            while (this.root.el.hasChildNodes()) {
                this.root.el.removeChild(this.root.el.firstChild);
            }
            while (newBG.root.el.hasChildNodes()) {
                const el = newBG.root.el.firstChild;
                newBG.root.el.removeChild(el);
                this.root.el.appendChild(el);
            }
            this.cx = newBG.cx;
            this.cy = newBG.cy;
            this.root.appendChild(this.textEl);
            this.textEl.moveTo(this.cx, this.cy);
        }
        width() {
            return this.getComputedTextLength() + this.padding * 2;
        }
    }
    pxtsprite.StandaloneTextButton = StandaloneTextButton;
    class CursorButton extends Button {
        constructor(root, cx, cy, width) {
            super(root, cx, cy);
            this.root.draw("rect")
                .fill("white")
                .size(width, width)
                .at(Math.floor(this.cx - width / 2), Math.floor(this.cy - width / 2));
        }
    }
    pxtsprite.CursorButton = CursorButton;
    function mkIconButton(icon, width, height = width + BUTTON_BOTTOM_BORDER_WIDTH - BUTTON_BORDER_WIDTH) {
        const g = drawSingleButton(width, height);
        return new TextButton(g, icon, "sprite-editor-icon");
    }
    pxtsprite.mkIconButton = mkIconButton;
    function mkXIconButton(icon, width, height = width + BUTTON_BOTTOM_BORDER_WIDTH - BUTTON_BORDER_WIDTH) {
        const g = drawSingleButton(width, height);
        return new TextButton(g, icon, "sprite-editor-xicon");
    }
    pxtsprite.mkXIconButton = mkXIconButton;
    function mkTextButton(text, width, height) {
        const g = drawSingleButton(width, height);
        const t = new TextButton(g, text, "sprite-editor-text");
        t.addClass("sprite-editor-label");
        return t;
    }
    pxtsprite.mkTextButton = mkTextButton;
    function drawLeftButton(width, height, lip, border, r) {
        const root = new svg.Group().appendClass("sprite-editor-button");
        const bg = root.draw("path")
            .appendClass("sprite-editor-button-bg");
        bg.d.moveTo(r, 0)
            .lineBy(width - r, 0)
            .lineBy(0, height)
            .lineBy(-(width - r), 0)
            .arcBy(r, r, 0, false, true, -r, -r)
            .lineBy(0, -(height - (r << 1)))
            .arcBy(r, r, 0, false, true, r, -r)
            .close();
        bg.update();
        const fg = root.draw("path")
            .appendClass("sprite-editor-button-fg");
        fg.d.moveTo(border + r, border)
            .lineBy(width - border - r, 0)
            .lineBy(0, height - lip - border)
            .lineBy(-(width - border - r), 0)
            .arcBy(r, r, 0, false, true, -r, -r)
            .lineBy(0, -(height - lip - border - (r << 1)))
            .arcBy(r, r, 0, false, true, r, -r)
            .close();
        fg.update();
        return {
            root,
            cx: border + (width - border) / 2,
            cy: border + (height - lip) / 2
        };
    }
    class CursorMultiButton {
        constructor(parent, width) {
            this.root = parent.group();
            const widths = [4, 7, 10];
            this.buttons = buttonGroup(65, 21, 3).map((b, i) => new CursorButton(b.root, b.cx, b.cy, widths[i]));
            this.buttons.forEach((button, index) => {
                button.onClick(() => this.handleClick(index));
                button.title(sizeAdjective(index));
                this.root.appendChild(button.getElement());
            });
        }
        handleClick(index) {
            if (index === this.selected)
                return;
            if (this.selected != undefined) {
                this.buttons[this.selected].setSelected(false);
            }
            this.selected = index;
            if (this.selected != undefined) {
                this.buttons[this.selected].setSelected(true);
            }
            if (this.indexHandler)
                this.indexHandler(index);
        }
        onSelected(cb) {
            this.indexHandler = cb;
        }
    }
    pxtsprite.CursorMultiButton = CursorMultiButton;
    class UndoRedoGroup {
        constructor(parent, host, width, height) {
            this.root = parent.group();
            this.host = host;
            const [undo, redo] = buttonGroup(width, height, 2);
            this.undo = new TextButton(undo, "\uf118", "sprite-editor-xicon");
            this.undo.onClick(() => this.host.undo());
            this.root.appendChild(this.undo.getElement());
            this.redo = new TextButton(redo, "\uf111", "sprite-editor-xicon");
            this.redo.onClick(() => this.host.redo());
            this.root.appendChild(this.redo.getElement());
        }
        translate(x, y) {
            this.root.translate(x, y);
        }
        updateState(undo, redo) {
            this.undo.setDisabled(undo);
            this.redo.setDisabled(redo);
        }
    }
    pxtsprite.UndoRedoGroup = UndoRedoGroup;
    function defaultColors(props) {
        if (!props.baseColor)
            props.baseColor = "#e95153";
        if (!props.backgroundColor)
            props.backgroundColor = "rgba(52,73,94,.2)";
        if (!props.borderColor)
            props.borderColor = "rgba(52,73,94,.4)";
        if (!props.selectedTextColor)
            props.selectedTextColor = props.baseColor;
        if (!props.unselectedTextColor)
            props.unselectedTextColor = "hsla(0,0%,100%,.9)";
        if (!props.switchColor)
            props.switchColor = "#ffffff";
        return props;
    }
    function sizeAdjective(cursorIndex) {
        switch (cursorIndex) {
            case 0: return "Small Cursor";
            case 1: return "Medium Cursor";
            case 2: return "Large Cursor";
        }
        return undefined;
    }
    function drawMidButton(width, height, lip, border) {
        const root = new svg.Group().appendClass("sprite-editor-button");
        const bg = root.draw("rect")
            .appendClass("sprite-editor-button-bg")
            .size(width, height);
        const fg = root.draw("rect")
            .appendClass("sprite-editor-button-fg")
            .size(width - border, height - lip - border)
            .at(border, border);
        return {
            root,
            cx: border + (width - border) / 2,
            cy: border + (height - lip) / 2
        };
    }
    function drawRightButton(width, height, lip, border, r) {
        const root = new svg.Group().appendClass("sprite-editor-button");
        const bg = root.draw("path")
            .appendClass("sprite-editor-button-bg");
        bg.d.moveTo(0, 0)
            .lineBy(width - r, 0)
            .arcBy(r, r, 0, false, true, r, r)
            .lineBy(0, height - (r << 1))
            .arcBy(r, r, 0, false, true, -r, r)
            .lineBy(-(width - r), 0)
            .lineBy(0, -height)
            .close();
        bg.update();
        const fg = root.draw("path")
            .appendClass("sprite-editor-button-fg");
        fg.d.moveTo(border, border)
            .lineBy(width - border - r, 0)
            .arcBy(r, r, 0, false, true, r, r)
            .lineBy(0, height - border - lip - (r << 1))
            .arcBy(r, r, 0, false, true, -r, r)
            .lineBy(-(width - border - r), 0)
            .lineBy(0, -(height - border - lip))
            .close();
        fg.update();
        const content = root.group().id("sprite-editor-button-content");
        content.translate(border + (width - (border << 1)) >> 1, (height - lip - border) >> 1);
        return {
            root,
            cx: width / 2,
            cy: border + (height - lip) / 2
        };
    }
    function drawSingleButton(width, height, lip = BUTTON_BOTTOM_BORDER_WIDTH, border = BUTTON_BORDER_WIDTH, r = BUTTON_CORNER_RADIUS) {
        const root = new svg.Group().appendClass("sprite-editor-button");
        root.draw("rect")
            .size(width, height)
            .corners(r, r)
            .appendClass("sprite-editor-button-bg");
        root.draw("rect")
            .at(border, border)
            .size(width - (border << 1), height - lip - border)
            .corners(r, r)
            .appendClass("sprite-editor-button-fg");
        return {
            root,
            cx: width / 2,
            cy: border + (height - lip) / 2
        };
    }
    function buttonGroup(width, height, segments, lip = BUTTON_BOTTOM_BORDER_WIDTH, border = BUTTON_BORDER_WIDTH, r = BUTTON_CORNER_RADIUS) {
        const available = width - (segments + 1) * border;
        const segmentWidth = Math.floor(available / segments);
        const result = [];
        for (let i = 0; i < segments; i++) {
            if (i === 0) {
                result.push(drawLeftButton(segmentWidth + border, height, lip, border, r));
            }
            else if (i === segments - 1) {
                const b = drawRightButton(segmentWidth + (border << 1), height, lip, border, r);
                b.root.translate((border + segmentWidth) * i, 0);
                result.push(b);
            }
            else {
                const b = drawMidButton(segmentWidth + border, height, lip, border);
                b.root.translate((border + segmentWidth) * i, 0);
                result.push(b);
            }
        }
        return result;
    }
    function mkText(text) {
        return new svg.Text(text)
            .anchor("middle")
            .setAttribute("dominant-baseline", "middle")
            .setAttribute("dy", (false) ? "0.3em" : "0.1em");
    }
    pxtsprite.mkText = mkText;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    const alphaCellWidth = 5;
    const dropdownPaddding = 4;
    const lightModeBackground = "#dedede";
    class CanvasGrid {
        constructor(palette, state, lightMode = false) {
            this.palette = palette;
            this.state = state;
            this.lightMode = lightMode;
            this.cellWidth = 16;
            this.cellHeight = 16;
            this.upHandler = (ev) => {
                this.endDrag();
                const [col, row] = this.clientEventToCell(ev);
                this.gesture.handle(InputEvent.Up, col, row);
                ev.stopPropagation();
                ev.preventDefault();
            };
            this.leaveHandler = (ev) => {
                this.endDrag();
                const [col, row] = this.clientEventToCell(ev);
                this.gesture.handle(InputEvent.Leave, col, row);
                ev.stopPropagation();
                ev.preventDefault();
            };
            this.moveHandler = (ev) => {
                const [col, row] = this.clientEventToCell(ev);
                if (col >= 0 && row >= 0 && col < this.image.width && row < this.image.height) {
                    if (ev.buttons & 1) {
                        this.gesture.handle(InputEvent.Down, col, row);
                    }
                    this.gesture.handle(InputEvent.Move, col, row);
                }
                ev.stopPropagation();
                ev.preventDefault();
            };
            this.hoverHandler = (ev) => {
                const [col, row] = this.clientEventToCell(ev);
                if (col >= 0 && row >= 0 && col < this.image.width && row < this.image.height) {
                    this.gesture.handle(InputEvent.Move, col, row);
                    this.gesture.isHover = true;
                }
                else if (this.gesture.isHover) {
                    this.gesture.isHover = false;
                    this.gesture.handle(InputEvent.Leave, -1, -1);
                }
            };
            this.paintLayer = document.createElement("canvas");
            this.paintLayer.setAttribute("class", "sprite-editor-canvas");
            this.overlayLayer = document.createElement("canvas");
            this.overlayLayer.setAttribute("class", "sprite-editor-canvas");
            if (!this.lightMode) {
                this.backgroundLayer = document.createElement("canvas");
                this.backgroundLayer.setAttribute("class", "sprite-editor-canvas");
                this.context = this.paintLayer.getContext("2d");
            }
            else {
                this.context = this.paintLayer.getContext("2d", { alpha: false });
                this.context.fillStyle = lightModeBackground;
                this.context.fill();
            }
            this.hideOverlay();
        }
        get image() {
            return this.state.image;
        }
        setEyedropperMouse(on) {
        }
        repaint() {
            this.clearContext(this.context);
            this.drawImage();
            if (this.state.floatingLayer)
                this.drawFloatingLayer();
            else
                this.hideOverlay();
        }
        applyEdit(edit, cursorCol, cursorRow, gestureEnd = false) {
            edit.doEdit(this.state);
            this.drawCursor(edit, cursorCol, cursorRow);
        }
        drawCursor(edit, col, row) {
            const cursor = edit.getCursor();
            if (cursor) {
                this.repaint();
                if (edit.showPreview) {
                    edit.drawCursor(col, row, (c, r) => {
                        this.drawColor(c, r, edit.color);
                    });
                }
                this.context.strokeStyle = "#898989";
                this.context.strokeRect((col + cursor.offsetX) * this.cellWidth, (row + cursor.offsetY) * this.cellHeight, cursor.width * this.cellWidth, cursor.height * this.cellHeight);
            }
            else if (edit.isStarted) {
                this.repaint();
            }
        }
        bitmap() {
            return this.image;
        }
        outerWidth() {
            return this.paintLayer.getBoundingClientRect().width;
        }
        outerHeight() {
            return this.paintLayer.getBoundingClientRect().height;
        }
        writeColor(col, row, color) {
            this.image.set(col, row, color);
            this.drawColor(col, row, color);
        }
        drawColor(col, row, color, context = this.context, transparency = !this.lightMode) {
            const x = col * this.cellWidth;
            const y = row * this.cellHeight;
            if (color) {
                context.fillStyle = this.palette[color - 1];
                context.fillRect(x, y, this.cellWidth, this.cellHeight);
            }
            else if (!transparency) {
                context.fillStyle = lightModeBackground;
                context.fillRect(x, y, this.cellWidth, this.cellHeight);
            }
        }
        restore(state, repaint = false) {
            if (state.height != this.image.height || state.width != this.image.width) {
                this.state = state.copy();
                this.resizeGrid(state.width, state.width * state.height);
            }
            else {
                this.state = state.copy();
            }
            if (repaint) {
                this.repaint();
            }
        }
        showResizeOverlay() {
            if (this.lightMode)
                return;
            if (this.fadeAnimation) {
                this.fadeAnimation.kill();
            }
            this.showOverlay();
            this.stopSelectAnimation();
            const w = this.overlayLayer.width;
            const h = this.overlayLayer.height;
            const context = this.overlayLayer.getContext("2d");
            const toastWidth = 100;
            const toastHeight = 40;
            const toastLeft = w / 2 - toastWidth / 2;
            const toastTop = h / 2 - toastWidth / 4;
            this.fadeAnimation = new Fade((opacity, dead) => {
                if (dead) {
                    this.drawFloatingLayer();
                    return;
                }
                this.clearContext(context);
                context.globalAlpha = opacity;
                context.fillStyle = "#898989";
                if (this.image.width <= 32 && this.image.height <= 32) {
                    for (let c = 1; c < this.image.width; c++) {
                        context.fillRect(c * this.cellWidth, 0, 1, h);
                    }
                    for (let r = 1; r < this.image.height; r++) {
                        context.fillRect(0, r * this.cellHeight, w, 1);
                    }
                }
                context.fillRect(toastLeft, toastTop, toastWidth, toastHeight);
                context.fillStyle = "#ffffff";
                context.font = "30px sans-serif";
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillText(this.image.width.toString(), toastLeft + toastWidth / 2 - 25, toastTop + toastHeight / 2);
                context.fillText("x", toastLeft + 50, toastTop + toastHeight / 2, 10);
                context.fillText(this.image.height.toString(), toastLeft + toastWidth / 2 + 25, toastTop + toastHeight / 2);
            }, 750, 500);
        }
        showOverlay() {
            this.overlayLayer.style.visibility = "visible";
        }
        hideOverlay() {
            this.stopSelectAnimation();
            this.overlayLayer.style.visibility = "hidden";
            if (this.fadeAnimation) {
                this.fadeAnimation.kill();
            }
        }
        resizeGrid(rowLength, numCells) {
            this.repaint();
        }
        setCellDimensions(width, height) {
            this.cellWidth = width | 0;
            this.cellHeight = height | 0;
            const canvasWidth = this.cellWidth * this.image.width;
            const canvasHeight = this.cellHeight * this.image.height;
            this.paintLayer.width = canvasWidth;
            this.paintLayer.height = canvasHeight;
            this.overlayLayer.width = canvasWidth;
            this.overlayLayer.height = canvasHeight;
            if (!this.lightMode) {
                this.backgroundLayer.width = canvasWidth;
                this.backgroundLayer.height = canvasHeight;
            }
        }
        setGridDimensions(width, height = width, lockAspectRatio = true) {
            const maxCellWidth = width / this.image.width;
            const maxCellHeight = height / this.image.height;
            if (lockAspectRatio) {
                const aspectRatio = this.cellWidth / this.cellHeight;
                if (aspectRatio >= 1) {
                    const w = Math.min(maxCellWidth, maxCellHeight * aspectRatio);
                    this.setCellDimensions(w, w * aspectRatio);
                }
                else {
                    const h = Math.min(maxCellHeight, maxCellWidth / aspectRatio);
                    this.setCellDimensions(h / aspectRatio, h);
                }
            }
            else {
                this.setCellDimensions(maxCellWidth, maxCellHeight);
            }
        }
        down(handler) {
            this.initDragSurface();
            this.gesture.subscribe(GestureType.Down, handler);
        }
        up(handler) {
            this.initDragSurface();
            this.gesture.subscribe(GestureType.Up, handler);
        }
        drag(handler) {
            this.initDragSurface();
            this.gesture.subscribe(GestureType.Drag, handler);
        }
        move(handler) {
            this.initDragSurface();
            this.gesture.subscribe(GestureType.Move, handler);
        }
        leave(handler) {
            this.initDragSurface();
            this.gesture.subscribe(GestureType.Leave, handler);
        }
        updateBounds(top, left, width, height) {
            this.layoutCanvas(this.paintLayer, top, left, width, height);
            this.layoutCanvas(this.overlayLayer, top, left, width, height);
            if (!this.lightMode) {
                this.layoutCanvas(this.backgroundLayer, top, left, width, height);
            }
            this.drawImage();
            this.drawBackground();
        }
        render(parent) {
            if (!this.lightMode) {
                parent.appendChild(this.backgroundLayer);
            }
            parent.appendChild(this.paintLayer);
            parent.appendChild(this.overlayLayer);
        }
        removeMouseListeners() {
            this.stopSelectAnimation();
            if (this.fadeAnimation)
                this.fadeAnimation.kill();
            this.endDrag();
        }
        onEditStart(col, row, edit) {
            edit.start(col, row, this.state);
        }
        onEditEnd(col, row, edit) {
            edit.end(col, row, this.state);
            this.drawFloatingLayer();
        }
        drawImage(image = this.image, context = this.context, left = 0, top = 0, transparency = !this.lightMode) {
            for (let c = 0; c < image.width; c++) {
                for (let r = 0; r < image.height; r++) {
                    this.drawColor(left + c, top + r, image.get(c, r), context, transparency);
                }
            }
        }
        drawBackground() {
            if (this.lightMode)
                return;
            const context = this.backgroundLayer.getContext("2d", { alpha: false });
            const alphaCols = Math.ceil(this.paintLayer.width / alphaCellWidth);
            const alphaRows = Math.ceil(this.paintLayer.height / alphaCellWidth);
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, this.paintLayer.width, this.paintLayer.height);
            context.fillStyle = "#dedede";
            for (let ac = 0; ac < alphaCols; ac++) {
                for (let ar = 0; ar < alphaRows; ar++) {
                    if ((ac + ar) % 2) {
                        context.fillRect(ac * alphaCellWidth, ar * alphaCellWidth, alphaCellWidth, alphaCellWidth);
                    }
                }
            }
        }
        clientEventToCell(ev) {
            const coord = clientCoord(ev);
            const bounds = this.paintLayer.getBoundingClientRect();
            const left = bounds.left + (window.scrollX !== null ? window.scrollX : window.pageXOffset);
            const top = bounds.top + (window.scrollY !== null ? window.scrollY : window.pageYOffset);
            this.mouseCol = Math.floor((coord.clientX - left) / this.cellWidth);
            this.mouseRow = Math.floor((coord.clientY - top) / this.cellHeight);
            return [
                this.mouseCol,
                this.mouseRow
            ];
        }
        drawFloatingLayer() {
            if (!this.state.floatingLayer) {
                return;
            }
            this.drawImage(this.state.floatingLayer, this.context, this.state.layerOffsetX, this.state.layerOffsetY, true);
            this.drawSelectionAnimation();
        }
        drawSelectionAnimation(dashOffset = 0) {
            if (!this.state.floatingLayer) {
                this.hideOverlay();
                return;
            }
            this.showOverlay();
            const context = this.overlayLayer.getContext("2d");
            this.clearContext(context);
            context.globalAlpha = 1;
            context.strokeStyle = "#303030";
            context.lineWidth = 2;
            context.setLineDash([5, 3]);
            context.lineDashOffset = dashOffset;
            context.strokeRect(this.state.layerOffsetX * this.cellWidth, this.state.layerOffsetY * this.cellHeight, this.state.floatingLayer.width * this.cellWidth, this.state.floatingLayer.height * this.cellHeight);
            if (!this.lightMode && !this.selectAnimation && (!this.fadeAnimation || this.fadeAnimation.dead)) {
                let drawLayer = () => {
                    dashOffset++;
                    requestAnimationFrame(() => this.drawSelectionAnimation(dashOffset));
                };
                this.selectAnimation = setInterval(drawLayer, 40);
            }
        }
        clearContext(context) {
            context.clearRect(0, 0, this.paintLayer.width, this.paintLayer.height);
        }
        initDragSurface() {
            if (!this.gesture) {
                this.gesture = new GestureState();
                this.bindEvents(this.paintLayer);
                this.bindEvents(this.overlayLayer);
            }
        }
        bindEvents(surface) {
        }
        startDrag() {
        }
        endDrag() {
        }
        layoutCanvas(canvas, top, left, width, height) {
            canvas.style.position = "absolute";
            if (this.image.width === this.image.height) {
                canvas.style.top = top + "px";
                canvas.style.left = left + "px";
            }
            else if (this.image.width > this.image.height) {
                canvas.style.top = (top + dropdownPaddding + (height - canvas.height) / 2) + "px";
                canvas.style.left = left + "px";
            }
            else {
                canvas.style.top = top + "px";
                canvas.style.left = (left + dropdownPaddding + (width - canvas.width) / 2) + "px";
            }
        }
        stopSelectAnimation() {
            if (this.selectAnimation) {
                clearInterval(this.selectAnimation);
                this.selectAnimation = undefined;
            }
        }
    }
    pxtsprite.CanvasGrid = CanvasGrid;
    let InputEvent;
    (function (InputEvent) {
        InputEvent[InputEvent["Up"] = 0] = "Up";
        InputEvent[InputEvent["Down"] = 1] = "Down";
        InputEvent[InputEvent["Move"] = 2] = "Move";
        InputEvent[InputEvent["Leave"] = 3] = "Leave";
    })(InputEvent || (InputEvent = {}));
    let GestureType;
    (function (GestureType) {
        GestureType[GestureType["Up"] = 0] = "Up";
        GestureType[GestureType["Down"] = 1] = "Down";
        GestureType[GestureType["Move"] = 2] = "Move";
        GestureType[GestureType["Drag"] = 3] = "Drag";
        GestureType[GestureType["Leave"] = 4] = "Leave";
    })(GestureType || (GestureType = {}));
    class GestureState {
        constructor() {
            this.isDown = false;
            this.isHover = false;
            this.handlers = {};
        }
        handle(event, col, row) {
            switch (event) {
                case InputEvent.Up:
                    this.update(col, row);
                    this.isDown = false;
                    this.fire(GestureType.Up);
                    break;
                case InputEvent.Down:
                    if (!this.isDown) {
                        this.update(col, row);
                        this.isDown = true;
                        this.fire(GestureType.Down);
                    }
                    break;
                case InputEvent.Move:
                    if (col === this.lastCol && row === this.lastRow)
                        return;
                    this.update(col, row);
                    if (this.isDown) {
                        this.fire(GestureType.Drag);
                    }
                    else {
                        this.fire(GestureType.Move);
                    }
                    break;
                case InputEvent.Leave:
                    this.update(col, row);
                    this.isDown = false;
                    this.fire(GestureType.Leave);
                    break;
            }
        }
        subscribe(type, handler) {
            this.handlers[type] = handler;
        }
        update(col, row) {
            this.lastCol = col;
            this.lastRow = row;
        }
        fire(type) {
            if (this.handlers[type]) {
                this.handlers[type](this.lastCol, this.lastRow);
            }
        }
    }
    class Fade {
        constructor(draw, delay, duration) {
            this.draw = draw;
            this.start = Date.now() + delay;
            this.end = this.start + duration;
            this.slope = 1 / duration;
            this.dead = false;
            draw(1, false);
            setTimeout(() => requestAnimationFrame(() => this.frame()), delay);
        }
        frame() {
            if (this.dead)
                return;
            const now = Date.now();
            if (now < this.end) {
                const v = 1 - (this.slope * (now - this.start));
                this.draw(v, false);
                requestAnimationFrame(() => this.frame());
            }
            else {
                this.kill();
                this.draw(0, true);
            }
        }
        kill() {
            this.dead = true;
        }
    }
    function clientCoord(ev) {
        if (ev.touches) {
            const te = ev;
            if (te.touches.length) {
                return te.touches[0];
            }
            return te.changedTouches[0];
        }
        return ev;
    }
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    class CanvasState {
        constructor(bitmap) {
            this.image = bitmap;
            this.layerOffsetX = 0;
            this.layerOffsetY = 0;
        }
        get width() {
            return this.image.width;
        }
        get height() {
            return this.image.height;
        }
        copy() {
            const res = new CanvasState();
            res.image = this.image.copy();
            if (this.floatingLayer) {
                res.floatingLayer = this.floatingLayer.copy();
                res.floatingLayer.x0 = this.layerOffsetX;
                res.floatingLayer.y0 = this.layerOffsetY;
            }
            res.layerOffsetX = this.layerOffsetX;
            res.layerOffsetY = this.layerOffsetY;
            return res;
        }
        equals(other) {
            if (!this.image.equals(other.image) || (this.floatingLayer && !other.floatingLayer) || (!this.floatingLayer && other.floatingLayer))
                return false;
            if (this.floatingLayer)
                return this.floatingLayer.equals(other.floatingLayer) && this.layerOffsetX === other.layerOffsetX && this.layerOffsetY === other.layerOffsetY;
            return true;
        }
        mergeFloatingLayer() {
            if (!this.floatingLayer)
                return;
            this.floatingLayer.x0 = this.layerOffsetX;
            this.floatingLayer.y0 = this.layerOffsetY;
            this.image.apply(this.floatingLayer, true);
            this.floatingLayer = undefined;
        }
        copyToLayer(left, top, width, height, cut = false) {
            if (width === 0 || height === 0)
                return;
            if (width < 0) {
                left += width;
                width = -width;
            }
            if (height < 0) {
                top += height;
                height = -height;
            }
            this.floatingLayer = this.image.copy(left, top, width, height);
            this.layerOffsetX = this.floatingLayer.x0;
            this.layerOffsetY = this.floatingLayer.y0;
            if (cut) {
                for (let c = 0; c < width; c++) {
                    for (let r = 0; r < height; r++) {
                        this.image.set(left + c, top + r, 0);
                    }
                }
            }
        }
        inFloatingLayer(col, row) {
            if (!this.floatingLayer)
                return false;
            col = col - this.layerOffsetX;
            row = row - this.layerOffsetY;
            return col >= 0 && col < this.floatingLayer.width && row >= 0 && row < this.floatingLayer.height;
        }
    }
    pxtsprite.CanvasState = CanvasState;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    class SpriteHeader {
        constructor(host) {
            this.host = host;
            this.div = document.createElement("div");
            this.div.setAttribute("id", "sprite-editor-header");
            this.root = new svg.SVG(this.div).id("sprite-editor-header-controls");
            this.toggle = new pxtsprite.Toggle(this.root, { leftText: "Editor", rightText: "Gallery", baseColor: "#4B7BEC" });
            this.toggle.onStateChange(isLeft => {
                if (isLeft) {
                }
                else {
                }
            });
        }
        getElement() {
            return this.div;
        }
        layout() {
            this.toggle.layout();
            this.toggle.translate((pxtsprite.TOTAL_HEIGHT - this.toggle.width()) / 2, (pxtsprite.HEADER_HEIGHT - this.toggle.height()) / 2);
        }
    }
    pxtsprite.SpriteHeader = SpriteHeader;
})(pxtsprite || (pxtsprite = {}));
function makeCloseButton() {
    const i = document.createElement("i");
    i.className = "icon close remove circle sprite-focus-hover";
    i.setAttribute("role", "presentation");
    i.setAttribute("aria-hidden", "true");
    const d = document.createElement("div");
    d.className = "closeIcon";
    d.setAttribute("tabindex", "0");
    d.setAttribute("role", "button");
    d.appendChild(i);
    return d;
}
var pxtsprite;
(function (pxtsprite) {
    const UNDO_REDO_WIDTH = 65;
    const SIZE_BUTTON_WIDTH = 65;
    const SIZE_CURSOR_MARGIN = 10;
    class ReporterBar {
        constructor(parent, host, height) {
            this.host = host;
            this.height = height;
            this.root = parent.group().id("sprite-editor-reporter-bar");
            this.undoRedo = new pxtsprite.UndoRedoGroup(this.root, host, UNDO_REDO_WIDTH, height);
            this.sizeButton = pxtsprite.mkTextButton("16x16", SIZE_BUTTON_WIDTH, height);
            this.sizeButton.onClick(() => {
                this.nextSize();
            });
            this.root.appendChild(this.sizeButton.getElement());
            this.doneButton = new pxtsprite.StandaloneTextButton(("Done"), height);
            this.doneButton.addClass("sprite-editor-confirm-button");
            this.doneButton.onClick(() => this.host.closeEditor());
            this.root.appendChild(this.doneButton.getElement());
            this.sizePresets = [
                [16, 16]
            ];
            this.cursorText = this.root.draw("text")
                .appendClass("sprite-editor-text")
                .appendClass("sprite-editor-label")
                .setAttribute("dominant-baseline", "middle")
                .setAttribute("dy", 2.5);
        }
        updateDimensions(width, height) {
            this.sizeButton.setText(`${width}x${height}`);
        }
        hideCursor() {
            this.cursorText.text("");
        }
        updateCursor(col, row) {
            this.cursorText.text(`${col},${row}`);
        }
        updateUndoRedo(undo, redo) {
            this.undoRedo.updateState(undo, redo);
        }
        layout(top, left, width) {
            this.root.translate(left, top);
            this.doneButton.layout();
            const doneWidth = this.doneButton.width();
            this.undoRedo.translate(width - UNDO_REDO_WIDTH - SIZE_CURSOR_MARGIN - doneWidth, 0);
            this.doneButton.getElement().translate(width - doneWidth, 0);
            this.cursorText.moveTo(SIZE_BUTTON_WIDTH + SIZE_CURSOR_MARGIN, this.height / 2);
        }
        setSizePresets(presets, currentWidth, currentHeight) {
            this.sizePresets = presets;
            this.sizeIndex = undefined;
            for (let i = 0; i < presets.length; i++) {
                const [w, h] = presets[i];
                if (w === currentWidth && h === currentHeight) {
                    this.sizeIndex = i;
                    break;
                }
            }
            this.updateDimensions(currentWidth, currentHeight);
        }
        nextSize() {
            if (this.sizeIndex == undefined) {
                this.sizeIndex = 0;
            }
            else {
                this.sizeIndex = (this.sizeIndex + 1) % this.sizePresets.length;
            }
            const [w, h] = this.sizePresets[this.sizeIndex];
            this.host.resize(w, h);
        }
    }
    pxtsprite.ReporterBar = ReporterBar;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    const TOOLBAR_WIDTH = 65;
    const INNER_BUTTON_MARGIN = 3;
    const PALETTE_BORDER_WIDTH = 1;
    const BUTTON_GROUP_SPACING = 3;
    const SELECTED_BORDER_WIDTH = 2;
    const COLOR_PREVIEW_HEIGHT = 30;
    const COLOR_MARGIN = 7;
    const TOOL_BUTTON_WIDTH = (TOOLBAR_WIDTH - INNER_BUTTON_MARGIN) / 2;
    const PALLETTE_SWATCH_WIDTH = (TOOLBAR_WIDTH - PALETTE_BORDER_WIDTH * 3) / 2;
    const TOOL_BUTTON_TOP = TOOLBAR_WIDTH / 3 + BUTTON_GROUP_SPACING;
    const PALETTE_TOP = TOOL_BUTTON_TOP + TOOL_BUTTON_WIDTH * 3 + INNER_BUTTON_MARGIN + COLOR_MARGIN;
    class SideBar {
        constructor(palette, host, parent) {
            this.palette = palette;
            this.host = host;
            this.root = parent.group().id("sprite-editor-sidebar");
            this.initSizes();
            this.initTools();
            this.initPalette();
        }
        setTool(tool) {
            this.host.setActiveTool(tool);
            if (this.selectedTool) {
                this.selectedTool.removeClass("selected");
            }
            this.selectedTool = this.getButtonForTool(tool);
            if (this.selectedTool) {
                this.selectedTool.addClass("selected");
            }
        }
        setColor(color) {
            this.host.setActiveColor(color);
            if (this.selectedSwatch) {
                this.selectedSwatch.stroke("none");
            }
            this.selectedSwatch = this.colorSwatches[color];
            if (this.selectedSwatch) {
                this.selectedSwatch.stroke("orange", SELECTED_BORDER_WIDTH * 2);
                this.colorPreview.fill(this.palette[color]);
            }
        }
        setCursorSize(size) {
            this.host.setToolWidth(size);
        }
        setWidth(width) {
            this.root.scale(width / TOOLBAR_WIDTH);
        }
        translate(left, top) {
            this.root.translate(left, top);
        }
        initSizes() {
            this.sizeGroup = this.root.group().id("sprite-editor-cursor-buttons");
            const buttonGroup = new pxtsprite.CursorMultiButton(this.sizeGroup, TOOLBAR_WIDTH);
            buttonGroup.onSelected(index => {
                this.setCursorSize(1 + (index * 2));
            });
            buttonGroup.selected = 0;
            buttonGroup.buttons[0].setSelected(true);
        }
        initTools() {
            this.buttonGroup = this.root.group()
                .id("sprite-editor-tools")
                .translate(0, TOOL_BUTTON_TOP);
            this.pencilTool = this.initButton(("Pencil"), "\uf0b2", pxtsprite.PaintTool.Normal);
            this.eraseTool = this.initButton(("Erase"), "\uf12d", pxtsprite.PaintTool.Erase);
            this.eraseTool.translate(1 + TOOL_BUTTON_WIDTH + INNER_BUTTON_MARGIN, 0);
            this.fillTool = this.initButton(("Fill"), "\uf102", pxtsprite.PaintTool.Fill, true);
            this.fillTool.translate(0, TOOL_BUTTON_WIDTH + INNER_BUTTON_MARGIN);
            this.rectangleTool = this.initButton(("Rectangle"), "\uf096", pxtsprite.PaintTool.Rectangle);
            this.rectangleTool.translate(1 + TOOL_BUTTON_WIDTH + INNER_BUTTON_MARGIN, TOOL_BUTTON_WIDTH + INNER_BUTTON_MARGIN);
            this.marqueeTool = this.initButton(("Marquee"), "\uf113", pxtsprite.PaintTool.Marquee, true);
            this.marqueeTool.translate(0, (TOOL_BUTTON_WIDTH + INNER_BUTTON_MARGIN) << 1);
            this.setTool(pxtsprite.PaintTool.Normal);
        }
        initPalette() {
            this.paletteGroup = this.root.group().id("sprite-editor-palette")
                .translate(0, PALETTE_TOP);
            const bgHeight = COLOR_PREVIEW_HEIGHT + PALETTE_BORDER_WIDTH * 2;
            this.paletteGroup.draw("rect")
                .fill("#000000")
                .size(TOOLBAR_WIDTH, bgHeight);
            this.paletteGroup.draw("rect")
                .fill("#000000")
                .at(0, bgHeight + COLOR_MARGIN)
                .size(TOOLBAR_WIDTH, PALETTE_BORDER_WIDTH + (this.palette.length >> 1) * (PALLETTE_SWATCH_WIDTH + PALETTE_BORDER_WIDTH));
            const clip = this.paletteGroup.def().create("clipPath", "sprite-editor-selected-color")
                .clipPathUnits(true);
            clip.draw("rect")
                .at(0, 0)
                .size(1, 1);
            this.colorPreview = this.paletteGroup.draw("rect")
                .at(PALETTE_BORDER_WIDTH, PALETTE_BORDER_WIDTH)
                .size(TOOLBAR_WIDTH - PALETTE_BORDER_WIDTH * 2, COLOR_PREVIEW_HEIGHT);
            this.colorSwatches = [];
            for (let i = 0; i < this.palette.length; i++) {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const swatch = this.paletteGroup
                    .draw("rect")
                    .size(PALLETTE_SWATCH_WIDTH, PALLETTE_SWATCH_WIDTH)
                    .at(col ? PALETTE_BORDER_WIDTH * 2 + PALLETTE_SWATCH_WIDTH : PALETTE_BORDER_WIDTH, bgHeight + COLOR_MARGIN + PALETTE_BORDER_WIDTH + row * (PALETTE_BORDER_WIDTH + PALLETTE_SWATCH_WIDTH))
                    .fill(this.palette[i])
                    .clipPath("url(#sprite-editor-selected-color)")
                    .onClick(() => this.setColor(i));
                swatch.title(`${i}`);
                this.colorSwatches.push(swatch);
            }
            this.setColor(0);
        }
        initButton(title, icon, tool, xicon = false) {
            const btn = xicon ? pxtsprite.mkXIconButton(icon, TOOL_BUTTON_WIDTH) : pxtsprite.mkIconButton(icon, TOOL_BUTTON_WIDTH);
            const shortcut = pxtsprite.getPaintToolShortcut(tool);
            if (shortcut)
                btn.shortcut(shortcut);
            btn.title(title);
            btn.onClick(() => {
                this.host.setIconsToDefault();
                this.setTool(tool);
            });
            this.buttonGroup.appendChild(btn.getElement());
            return btn;
        }
        getButtonForTool(tool) {
            switch (tool) {
                case pxtsprite.PaintTool.Normal:
                case pxtsprite.PaintTool.Line: return this.pencilTool;
                case pxtsprite.PaintTool.Erase: return this.eraseTool;
                case pxtsprite.PaintTool.Fill: return this.fillTool;
                case pxtsprite.PaintTool.Rectangle:
                case pxtsprite.PaintTool.Circle: return this.rectangleTool;
                case pxtsprite.PaintTool.Marquee: return this.marqueeTool;
                default: return undefined;
            }
        }
    }
    pxtsprite.SideBar = SideBar;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    let PaintTool;
    (function (PaintTool) {
        PaintTool[PaintTool["Normal"] = 0] = "Normal";
        PaintTool[PaintTool["Rectangle"] = 1] = "Rectangle";
        PaintTool[PaintTool["Outline"] = 2] = "Outline";
        PaintTool[PaintTool["Circle"] = 3] = "Circle";
        PaintTool[PaintTool["Fill"] = 4] = "Fill";
        PaintTool[PaintTool["Line"] = 5] = "Line";
        PaintTool[PaintTool["Erase"] = 6] = "Erase";
        PaintTool[PaintTool["Marquee"] = 7] = "Marquee";
    })(PaintTool = pxtsprite.PaintTool || (pxtsprite.PaintTool = {}));
    function getPaintToolShortcut(tool) {
        switch (tool) {
            case PaintTool.Normal:
                return "p";
            case PaintTool.Rectangle:
                return "r";
            case PaintTool.Circle:
                return "c";
            case PaintTool.Fill:
                return "b";
            case PaintTool.Line:
                return "l";
            case PaintTool.Erase:
                return "e";
            case PaintTool.Marquee:
                return "s";
            default:
                return undefined;
        }
    }
    pxtsprite.getPaintToolShortcut = getPaintToolShortcut;
    class Cursor {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.offsetX = -(width >> 1);
            this.offsetY = -(height >> 1);
        }
    }
    pxtsprite.Cursor = Cursor;
    class Edit {
        constructor(canvasWidth, canvasHeight, color, toolWidth) {
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.color = color;
            this.toolWidth = toolWidth;
        }
        doEdit(state) {
            if (this.isStarted) {
                this.doEditCore(state);
            }
        }
        start(cursorCol, cursorRow, state) {
            this.isStarted = true;
            this.startCol = cursorCol;
            this.startRow = cursorRow;
            state.mergeFloatingLayer();
        }
        end(col, row, state) {
        }
        getCursor() {
            return new Cursor(this.toolWidth, this.toolWidth);
        }
        drawCursor(col, row, draw) {
            draw(col, row);
        }
    }
    pxtsprite.Edit = Edit;
    class SelectionEdit extends Edit {
        update(col, row) {
            this.endCol = col;
            this.endRow = row;
            if (!this.isDragged && !(col == this.startCol && row == this.startRow)) {
                this.isDragged = true;
            }
        }
        topLeft() {
            return {
                x: Math.min(this.startCol, this.endCol),
                y: Math.min(this.startRow, this.endRow)
            };
        }
        bottomRight() {
            return {
                x: Math.max(this.startCol, this.endCol),
                y: Math.max(this.startRow, this.endRow)
            };
        }
    }
    pxtsprite.SelectionEdit = SelectionEdit;
    class PaintEdit extends Edit {
        constructor(canvasWidth, canvasHeight, color, toolWidth) {
            super(canvasWidth, canvasHeight, color, toolWidth);
            this.showPreview = true;
            this.mask = new pxtsprite.Bitmask(canvasWidth, canvasHeight);
        }
        update(col, row) {
            this.interpolate(this.startCol, this.startRow, col, row);
            this.startCol = col;
            this.startRow = row;
        }
        interpolate(x0, y0, x1, y1) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            const draw = (c, r) => this.mask.set(c, r);
            if (dx === 0) {
                const startY = dy >= 0 ? y0 : y1;
                const endY = dy >= 0 ? y1 : y0;
                for (let y = startY; y <= endY; y++) {
                    this.drawCore(x0, y, draw);
                }
                return;
            }
            const xStep = dx > 0 ? 1 : -1;
            const yStep = dy > 0 ? 1 : -1;
            const dErr = Math.abs(dy / dx);
            let err = 0;
            let y = y0;
            for (let x = x0; xStep > 0 ? x <= x1 : x >= x1; x += xStep) {
                this.drawCore(x, y, draw);
                err += dErr;
                while (err >= 0.5) {
                    if (yStep > 0 ? y <= y1 : y >= y1) {
                        this.drawCore(x, y, draw);
                    }
                    y += yStep;
                    err -= 1;
                }
            }
        }
        doEditCore(state) {
            for (let c = 0; c < state.width; c++) {
                for (let r = 0; r < state.height; r++) {
                    if (this.mask.get(c, r)) {
                        state.image.set(c, r, this.color);
                    }
                }
            }
        }
        drawCursor(col, row, draw) {
            this.drawCore(col, row, draw);
        }
        drawCore(col, row, setPixel) {
            col = col - Math.floor(this.toolWidth / 2);
            row = row - Math.floor(this.toolWidth / 2);
            for (let i = 0; i < this.toolWidth; i++) {
                for (let j = 0; j < this.toolWidth; j++) {
                    const c = col + i;
                    const r = row + j;
                    if (c >= 0 && c < this.canvasWidth && r >= 0 && r < this.canvasHeight) {
                        setPixel(col + i, row + j);
                    }
                }
            }
        }
    }
    pxtsprite.PaintEdit = PaintEdit;
    class RectangleEdit extends SelectionEdit {
        constructor() {
            super(...arguments);
            this.showPreview = true;
        }
        doEditCore(state) {
            const tl = this.topLeft();
            const br = this.bottomRight();
            for (let c = tl.x; c <= br.x; c++) {
                for (let r = tl.y; r <= br.y; r++) {
                    state.image.set(c, r, this.color);
                }
            }
        }
    }
    pxtsprite.RectangleEdit = RectangleEdit;
    class OutlineEdit extends SelectionEdit {
        constructor() {
            super(...arguments);
            this.showPreview = true;
        }
        doEditCore(state) {
            let tl = this.topLeft();
            tl.x -= this.toolWidth >> 1;
            tl.y -= this.toolWidth >> 1;
            let br = this.bottomRight();
            br.x += this.toolWidth >> 1;
            br.y += this.toolWidth >> 1;
            for (let i = 0; i < this.toolWidth; i++) {
                this.drawRectangle(state, { x: tl.x + i, y: tl.y + i }, { x: br.x - i, y: br.y - i });
            }
        }
        drawRectangle(state, tl, br) {
            if (tl.x > br.x || tl.y > br.y)
                return;
            for (let c = tl.x; c <= br.x; c++) {
                state.image.set(c, tl.y, this.color);
                state.image.set(c, br.y, this.color);
            }
            for (let r = tl.y; r <= br.y; r++) {
                state.image.set(tl.x, r, this.color);
                state.image.set(br.x, r, this.color);
            }
        }
        drawCursor(col, row, draw) {
            this.drawCore(col, row, draw);
        }
        drawCore(col, row, setPixel) {
            col = col - Math.floor(this.toolWidth / 2);
            row = row - Math.floor(this.toolWidth / 2);
            for (let i = 0; i < this.toolWidth; i++) {
                for (let j = 0; j < this.toolWidth; j++) {
                    const c = col + i;
                    const r = row + j;
                    if (c >= 0 && c < this.canvasWidth && r >= 0 && r < this.canvasHeight) {
                        setPixel(col + i, row + j);
                    }
                }
            }
        }
    }
    pxtsprite.OutlineEdit = OutlineEdit;
    class LineEdit extends SelectionEdit {
        constructor() {
            super(...arguments);
            this.showPreview = true;
        }
        doEditCore(state) {
            this.bresenham(this.startCol, this.startRow, this.endCol, this.endRow, state);
        }
        bresenham(x0, y0, x1, y1, state) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            const draw = (c, r) => state.image.set(c, r, this.color);
            if (dx === 0) {
                const startY = dy >= 0 ? y0 : y1;
                const endY = dy >= 0 ? y1 : y0;
                for (let y = startY; y <= endY; y++) {
                    this.drawCore(x0, y, draw);
                }
                return;
            }
            const xStep = dx > 0 ? 1 : -1;
            const yStep = dy > 0 ? 1 : -1;
            const dErr = Math.abs(dy / dx);
            let err = 0;
            let y = y0;
            for (let x = x0; xStep > 0 ? x <= x1 : x >= x1; x += xStep) {
                this.drawCore(x, y, draw);
                err += dErr;
                while (err >= 0.5) {
                    if (yStep > 0 ? y <= y1 : y >= y1) {
                        this.drawCore(x, y, draw);
                    }
                    y += yStep;
                    err -= 1;
                }
            }
        }
        drawCursor(col, row, draw) {
            this.drawCore(col, row, draw);
        }
        drawCore(col, row, draw) {
            col = col - Math.floor(this.toolWidth / 2);
            row = row - Math.floor(this.toolWidth / 2);
            for (let i = 0; i < this.toolWidth; i++) {
                for (let j = 0; j < this.toolWidth; j++) {
                    const c = col + i;
                    const r = row + j;
                    draw(c, r);
                }
            }
        }
    }
    pxtsprite.LineEdit = LineEdit;
    class CircleEdit extends SelectionEdit {
        constructor() {
            super(...arguments);
            this.showPreview = true;
        }
        doEditCore(state) {
            const tl = this.topLeft();
            const br = this.bottomRight();
            const dx = br.x - tl.x;
            const dy = br.y - tl.y;
            const radius = Math.floor(Math.hypot(dx, dy));
            const cx = this.startCol;
            const cy = this.startRow;
            this.midpoint(cx, cy, radius, state);
        }
        midpoint(cx, cy, radius, state) {
            let x = radius - 1;
            let y = 0;
            let dx = 1;
            let dy = 1;
            let err = dx - (radius * 2);
            while (x >= y) {
                state.image.set(cx + x, cy + y, this.color);
                state.image.set(cx + x, cy - y, this.color);
                state.image.set(cx + y, cy + x, this.color);
                state.image.set(cx + y, cy - x, this.color);
                state.image.set(cx - y, cy + x, this.color);
                state.image.set(cx - y, cy - x, this.color);
                state.image.set(cx - x, cy + y, this.color);
                state.image.set(cx - x, cy - y, this.color);
                if (err <= 0) {
                    y++;
                    err += dy;
                    dy += 2;
                }
                if (err > 0) {
                    x--;
                    dx += 2;
                    err += dx - (radius * 2);
                }
            }
        }
        getCursor() {
            return new Cursor(1, 1);
        }
    }
    pxtsprite.CircleEdit = CircleEdit;
    class FillEdit extends Edit {
        constructor() {
            super(...arguments);
            this.showPreview = true;
        }
        start(col, row, state) {
            this.isStarted = true;
            this.col = col;
            this.row = row;
            state.mergeFloatingLayer();
        }
        update(col, row) {
            this.col = col;
            this.row = row;
        }
        doEditCore(state) {
            const replColor = state.image.get(this.col, this.row);
            if (replColor === this.color) {
                return;
            }
            const mask = new pxtsprite.Bitmask(state.width, state.height);
            mask.set(this.col, this.row);
            const q = [{ x: this.col, y: this.row }];
            while (q.length) {
                const curr = q.pop();
                if (state.image.get(curr.x, curr.y) === replColor) {
                    state.image.set(curr.x, curr.y, this.color);
                    tryPush(curr.x + 1, curr.y);
                    tryPush(curr.x - 1, curr.y);
                    tryPush(curr.x, curr.y + 1);
                    tryPush(curr.x, curr.y - 1);
                }
            }
            function tryPush(x, y) {
                if (x >= 0 && x < mask.width && y >= 0 && y < mask.height && !mask.get(x, y)) {
                    mask.set(x, y);
                    q.push({ x: x, y: y });
                }
            }
        }
        getCursor() {
            return new Cursor(1, 1);
        }
    }
    pxtsprite.FillEdit = FillEdit;
    class MarqueeEdit extends SelectionEdit {
        constructor() {
            super(...arguments);
            this.isMove = false;
            this.showPreview = false;
        }
        start(cursorCol, cursorRow, state) {
            this.isStarted = true;
            this.startCol = cursorCol;
            this.startRow = cursorRow;
            if (state.floatingLayer) {
                if (state.inFloatingLayer(cursorCol, cursorRow)) {
                    this.isMove = true;
                }
                else {
                    state.mergeFloatingLayer();
                }
            }
        }
        end(cursorCol, cursorRow, state) {
            if (!this.isDragged && state.floatingLayer) {
                state.mergeFloatingLayer();
            }
        }
        doEditCore(state) {
            const tl = this.topLeft();
            const br = this.bottomRight();
            if (this.isDragged) {
                if (this.isMove) {
                    state.layerOffsetX = state.floatingLayer.x0 + this.endCol - this.startCol;
                    state.layerOffsetY = state.floatingLayer.y0 + this.endRow - this.startRow;
                }
                else {
                    state.copyToLayer(tl.x, tl.y, br.x - tl.x + 1, br.y - tl.y + 1, true);
                }
            }
        }
        getCursor() {
            return undefined;
        }
    }
    pxtsprite.MarqueeEdit = MarqueeEdit;
})(pxtsprite || (pxtsprite = {}));
var pxtsprite;
(function (pxtsprite) {
    pxtsprite.TOTAL_HEIGHT = 500;
    const PADDING = 10;
    const DROP_DOWN_PADDING = 4;
    pxtsprite.HEADER_HEIGHT = 50;
    const HEADER_CANVAS_MARGIN = 10;
    const REPORTER_BAR_HEIGHT = 31;
    const REPORTER_BAR_CANVAS_MARGIN = 5;
    const SIDEBAR_CANVAS_MARGIN = 10;
    const SIDEBAR_WIDTH = 65;
    const CANVAS_HEIGHT = pxtsprite.TOTAL_HEIGHT - pxtsprite.HEADER_HEIGHT - HEADER_CANVAS_MARGIN
        - REPORTER_BAR_HEIGHT - REPORTER_BAR_CANVAS_MARGIN - PADDING + DROP_DOWN_PADDING * 2;
    const WIDTH = PADDING + SIDEBAR_WIDTH + SIDEBAR_CANVAS_MARGIN + CANVAS_HEIGHT + PADDING - DROP_DOWN_PADDING * 2;
    class SpriteEditor {
        constructor(bitmap, blocksInfo, lightMode = false) {
            this.lightMode = lightMode;
            this.activeTool = pxtsprite.PaintTool.Normal;
            this.toolWidth = 1;
            this.color = 1;
            this.cursorCol = 0;
            this.cursorRow = 0;
            this.undoStack = [];
            this.redoStack = [];
            this.columns = 16;
            this.rows = 16;
            this.shiftDown = false;
            this.altDown = false;
            this.mouseDown = false;
            this.keyDown = (event) => {
                if (event.keyCode == 16) {
                    this.shiftDown = true;
                    this.shiftAction();
                }
                if (event.keyCode === 18) {
                    this.discardEdit();
                    this.paintSurface.setEyedropperMouse(true);
                    this.altDown = true;
                }
                if (this.state.floatingLayer) {
                    let didSomething = true;
                    switch (event.keyCode) {
                        case 8:
                        case 46:
                            event.preventDefault();
                            event.stopPropagation();
                            this.state.floatingLayer = undefined;
                            break;
                        case 37:
                            this.state.layerOffsetX--;
                            break;
                        case 38:
                            this.state.layerOffsetY--;
                            break;
                        case 39:
                            this.state.layerOffsetX++;
                            break;
                        case 40:
                            this.state.layerOffsetY++;
                            break;
                        default:
                            didSomething = false;
                    }
                    if (didSomething) {
                        this.updateEdit();
                        this.pushState(true);
                        this.paintSurface.restore(this.state, true);
                    }
                }
                const tools = [
                    pxtsprite.PaintTool.Fill,
                    pxtsprite.PaintTool.Normal,
                    pxtsprite.PaintTool.Rectangle,
                    pxtsprite.PaintTool.Erase,
                    pxtsprite.PaintTool.Circle,
                    pxtsprite.PaintTool.Line,
                    pxtsprite.PaintTool.Marquee
                ];
                tools.forEach(tool => {
                    if (event.key === pxtsprite.getPaintToolShortcut(tool)) {
                        this.setIconsToDefault();
                        this.switchIconTo(tool);
                        this.sidebar.setTool(tool);
                    }
                });
                const zeroKeyCode = 48;
                const nineKeyCode = 57;
                if (event.keyCode >= zeroKeyCode && event.keyCode <= nineKeyCode) {
                    let color = event.keyCode - zeroKeyCode;
                    if (this.shiftDown) {
                        color += 9;
                    }
                    if (color <= this.colors.length) {
                        this.sidebar.setColor(color);
                    }
                }
            };
            this.keyUp = (event) => {
                if (event.keyCode === 16) {
                    this.shiftDown = false;
                    this.clearShiftAction();
                }
                else if (event.keyCode === 18) {
                    this.altDown = false;
                    this.paintSurface.setEyedropperMouse(false);
                    this.updateEdit();
                }
            };
            this.undoRedoEvent = (event) => {
                const controlOrMeta = event.ctrlKey || event.metaKey;
                if (event.key === "Undo" || (controlOrMeta && event.key === "z")) {
                    this.undo();
                    event.preventDefault();
                    event.stopPropagation();
                }
                else if (event.key === "Redo" || (controlOrMeta && event.key === "y")) {
                    this.redo();
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            this.colors = [
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
            ];
            this.columns = bitmap.width;
            this.rows = bitmap.height;
            this.state = new pxtsprite.CanvasState(bitmap.copy());
            this.root = new svg.SVG();
            this.root.setClass("sprite-canvas-controls");
            this.group = this.root.group();
            this.createDefs();
            this.paintSurface = new pxtsprite.CanvasGrid(this.colors, this.state.copy(), this.lightMode);
            this.paintSurface.drag((col, row) => {
                this.debug("gesture (" + pxtsprite.PaintTool[this.activeTool] + ")");
                if (!this.altDown) {
                    this.setCell(col, row, this.color, false);
                }
                this.bottomBar.updateCursor(col, row);
            });
            this.paintSurface.up((col, row) => {
                this.debug("gesture end (" + pxtsprite.PaintTool[this.activeTool] + ")");
                if (this.altDown) {
                    const color = this.state.image.get(col, row);
                    this.sidebar.setColor(color);
                }
                else {
                    this.paintSurface.onEditEnd(col, row, this.edit);
                    if (this.state.floatingLayer && !this.paintSurface.state.floatingLayer) {
                        this.pushState(true);
                        this.state = this.paintSurface.state.copy();
                        this.rePaint();
                    }
                    this.commit();
                    this.shiftAction();
                }
                this.mouseDown = false;
            });
            this.paintSurface.down((col, row) => {
                if (!this.altDown) {
                    this.setCell(col, row, this.color, false);
                }
                this.mouseDown = true;
            });
            this.paintSurface.move((col, row) => {
                this.drawCursor(col, row);
                this.shiftAction();
                this.bottomBar.updateCursor(col, row);
            });
            this.paintSurface.leave(() => {
                if (this.edit) {
                    this.rePaint();
                    if (this.edit.isStarted && !this.shiftDown) {
                        this.commit();
                    }
                }
                this.bottomBar.hideCursor();
            });
            this.sidebar = new pxtsprite.SideBar(['url("#alpha-background")'].concat(this.colors), this, this.group);
            this.sidebar.setColor(this.colors.length >= 3 ? 3 : 1);
            this.header = new pxtsprite.SpriteHeader(this);
            this.bottomBar = new pxtsprite.ReporterBar(this.group, this, REPORTER_BAR_HEIGHT);
            this.updateUndoRedo();
        }
        setCell(col, row, color, commit) {
            if (commit) {
                this.state.image.set(col, row, color);
                this.paintCell(col, row, color);
            }
            else if (this.edit) {
                if (!this.edit.isStarted) {
                    this.paintSurface.onEditStart(col, row, this.edit);
                    if (this.state.floatingLayer && !this.paintSurface.state.floatingLayer) {
                        this.pushState(true);
                        this.state = this.paintSurface.state.copy();
                    }
                }
                this.edit.update(col, row);
                this.cursorCol = col;
                this.cursorRow = row;
                this.paintEdit(this.edit, col, row);
            }
        }
        render(el) {
            el.appendChild(this.header.getElement());
            this.paintSurface.render(el);
            el.appendChild(this.root.el);
            this.layout();
            this.root.attr({ "width": this.outerWidth() + "px", "height": this.outerHeight() + "px" });
            this.root.el.style.position = "absolute";
            this.root.el.style.top = "0px";
            this.root.el.style.left = "0px";
        }
        layout() {
            if (!this.root) {
                return;
            }
            this.paintSurface.setGridDimensions(CANVAS_HEIGHT);
            const paintAreaTop = pxtsprite.HEADER_HEIGHT + HEADER_CANVAS_MARGIN;
            const paintAreaLeft = PADDING + SIDEBAR_WIDTH + SIDEBAR_CANVAS_MARGIN;
            this.sidebar.translate(PADDING, paintAreaTop);
            this.paintSurface.updateBounds(paintAreaTop, paintAreaLeft, CANVAS_HEIGHT, CANVAS_HEIGHT);
            this.bottomBar.layout(paintAreaTop + CANVAS_HEIGHT + REPORTER_BAR_CANVAS_MARGIN, paintAreaLeft, CANVAS_HEIGHT);
            this.header.layout();
        }
        rePaint() {
            this.paintSurface.repaint();
        }
        setActiveColor(color, setPalette = false) {
            if (setPalette) {
            }
            else if (this.color != color) {
                this.color = color;
                if (this.activeTool === pxtsprite.PaintTool.Erase) {
                    this.sidebar.setTool(pxtsprite.PaintTool.Normal);
                }
                else {
                    this.updateEdit();
                }
            }
        }
        setActiveTool(tool) {
            if (this.activeTool != tool) {
                this.activeTool = tool;
                this.updateEdit();
            }
        }
        setToolWidth(width) {
            if (this.toolWidth != width) {
                this.toolWidth = width;
                this.updateEdit();
            }
        }
        initializeUndoRedo(undoStack, redoStack) {
            if (undoStack) {
                this.undoStack = undoStack;
            }
            if (redoStack) {
                this.redoStack = redoStack;
            }
            this.updateUndoRedo();
        }
        getUndoStack() {
            return this.undoStack.slice();
        }
        getRedoStack() {
            return this.redoStack.slice();
        }
        undo() {
            if (this.undoStack.length) {
                this.debug("undo");
                const todo = this.undoStack.pop();
                this.pushState(false);
                if (todo.equals(this.state)) {
                    this.undo();
                    return;
                }
                this.restore(todo);
            }
            this.updateUndoRedo();
        }
        redo() {
            if (this.redoStack.length) {
                this.debug("redo");
                const todo = this.redoStack.pop();
                this.pushState(true);
                this.restore(todo);
            }
            this.updateUndoRedo();
        }
        resize(width, height) {
            if (!this.cachedState) {
                this.cachedState = this.state.copy();
                this.undoStack.push(this.cachedState);
                this.redoStack = [];
            }
            this.state.image = pxtsprite.resizeBitmap(this.cachedState.image, width, height);
            this.afterResize(true);
        }
        setSizePresets(presets) {
            this.bottomBar.setSizePresets(presets, this.columns, this.rows);
        }
        canvasWidth() {
            return this.columns;
        }
        canvasHeight() {
            return this.rows;
        }
        outerWidth() {
            return WIDTH;
        }
        outerHeight() {
            return pxtsprite.TOTAL_HEIGHT;
        }
        bitmap() {
            return this.state;
        }
        showGallery() {
        }
        hideGallery() {
        }
        closeEditor() {
            if (this.closeHandler) {
                const ch = this.closeHandler;
                this.closeHandler = undefined;
                ch();
            }
            if (this.state.floatingLayer) {
                this.state.mergeFloatingLayer();
                this.pushState(true);
            }
        }
        onClose(handler) {
            this.closeHandler = handler;
        }
        switchIconTo(tool) {
            if (this.activeTool === tool)
                return;
            const btn = this.sidebar.getButtonForTool(tool);
            switch (tool) {
                case pxtsprite.PaintTool.Rectangle:
                    updateIcon(btn, "\uf096", "Rectangle");
                    break;
                case pxtsprite.PaintTool.Circle:
                    updateIcon(btn, "\uf10c", "Circle");
                    break;
                case pxtsprite.PaintTool.Normal:
                    updateIcon(btn, "\uf040", "Pencil");
                    break;
                case pxtsprite.PaintTool.Line:
                    updateIcon(btn, "\uf07e", "Line");
                    break;
                default:
                    return;
            }
            btn.onClick(() => {
                if (tool != pxtsprite.PaintTool.Circle && tool != pxtsprite.PaintTool.Line) {
                    this.setIconsToDefault();
                    this.sidebar.setTool(tool);
                }
            });
            function updateIcon(button, text, title) {
                const shortcut = pxtsprite.getPaintToolShortcut(tool);
                button.setText(text);
                button.title(title);
                button.shortcut(shortcut);
            }
        }
        setIconsToDefault() {
            this.switchIconTo(pxtsprite.PaintTool.Rectangle);
            this.switchIconTo(pxtsprite.PaintTool.Normal);
        }
        addKeyListeners() {
            document.addEventListener("keydown", this.keyDown);
            document.addEventListener("keyup", this.keyUp);
            document.addEventListener("keydown", this.undoRedoEvent, true);
        }
        removeKeyListeners() {
            document.removeEventListener("keydown", this.keyDown);
            document.removeEventListener("keyup", this.keyUp);
            document.removeEventListener("keydown", this.undoRedoEvent, true);
            this.paintSurface.removeMouseListeners();
        }
        afterResize(showOverlay) {
            this.columns = this.state.width;
            this.rows = this.state.height;
            this.paintSurface.restore(this.state, true);
            this.bottomBar.updateDimensions(this.columns, this.rows);
            this.layout();
            if (showOverlay)
                this.paintSurface.showResizeOverlay();
            this.updateEdit();
        }
        drawCursor(col, row) {
            if (this.edit) {
                this.paintSurface.drawCursor(this.edit, col, row);
            }
        }
        paintEdit(edit, col, row, gestureEnd = false) {
            this.paintSurface.restore(this.state);
            this.paintSurface.applyEdit(edit, col, row, gestureEnd);
        }
        commit() {
            if (this.edit) {
                if (this.cachedState) {
                    this.cachedState = undefined;
                }
                this.pushState(true);
                this.paintEdit(this.edit, this.cursorCol, this.cursorRow, true);
                this.state = this.paintSurface.state.copy();
                this.updateEdit();
                this.redoStack = [];
            }
        }
        pushState(undo) {
            const stack = undo ? this.undoStack : this.redoStack;
            if (stack.length && this.state.equals(stack[stack.length - 1])) {
                return;
            }
            stack.push(this.state.copy());
            this.updateUndoRedo();
        }
        discardEdit() {
            if (this.edit) {
                this.edit = undefined;
                this.rePaint();
            }
        }
        updateEdit() {
            if (!this.altDown) {
                this.edit = this.newEdit();
            }
        }
        restore(state) {
            if (state.width !== this.state.width || state.height !== this.state.height) {
                this.state = state;
                this.afterResize(false);
            }
            else {
                this.state = state.copy();
                this.paintSurface.restore(state, true);
            }
        }
        updateUndoRedo() {
            this.bottomBar.updateUndoRedo(this.undoStack.length === 0, this.redoStack.length === 0);
        }
        paintCell(col, row, color) {
            this.paintSurface.writeColor(col, row, color);
        }
        newEdit() {
            switch (this.activeTool) {
                case pxtsprite.PaintTool.Normal:
                    return new pxtsprite.PaintEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Rectangle:
                    return new pxtsprite.OutlineEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Outline:
                    return new pxtsprite.OutlineEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Line:
                    return new pxtsprite.LineEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Circle:
                    return new pxtsprite.CircleEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Erase:
                    return new pxtsprite.PaintEdit(this.columns, this.rows, 0, this.toolWidth);
                case pxtsprite.PaintTool.Fill:
                    return new pxtsprite.FillEdit(this.columns, this.rows, this.color, this.toolWidth);
                case pxtsprite.PaintTool.Marquee:
                    return new pxtsprite.MarqueeEdit(this.columns, this.rows, this.color, this.toolWidth);
            }
        }
        shiftAction() {
            if (!this.shiftDown || this.altDown)
                return;
            switch (this.activeTool) {
                case pxtsprite.PaintTool.Line:
                case pxtsprite.PaintTool.Rectangle:
                case pxtsprite.PaintTool.Circle:
                    this.setCell(this.paintSurface.mouseCol, this.paintSurface.mouseRow, this.color, false);
                    break;
            }
        }
        clearShiftAction() {
            if (this.mouseDown)
                return;
            switch (this.activeTool) {
                case pxtsprite.PaintTool.Line:
                case pxtsprite.PaintTool.Rectangle:
                case pxtsprite.PaintTool.Circle:
                    this.updateEdit();
                    this.paintSurface.restore(this.state, true);
                    break;
            }
        }
        debug(msg) {
        }
        createDefs() {
            this.root.define(defs => {
                const p = defs.create("pattern", "alpha-background")
                    .size(10, 10)
                    .units(svg.PatternUnits.userSpaceOnUse);
                p.draw("rect")
                    .at(0, 0)
                    .size(10, 10)
                    .fill("white");
                p.draw("rect")
                    .at(0, 0)
                    .size(5, 5)
                    .fill("#dedede");
                p.draw("rect")
                    .at(5, 5)
                    .size(5, 5)
                    .fill("#dedede");
            });
        }
    }
    pxtsprite.SpriteEditor = SpriteEditor;
})(pxtsprite || (pxtsprite = {}));
var svg;
(function (svg) {
    let PatternUnits;
    (function (PatternUnits) {
        PatternUnits[PatternUnits["userSpaceOnUse"] = 0] = "userSpaceOnUse";
        PatternUnits[PatternUnits["objectBoundingBox"] = 1] = "objectBoundingBox";
    })(PatternUnits = svg.PatternUnits || (svg.PatternUnits = {}));
    let LengthUnit;
    (function (LengthUnit) {
        LengthUnit[LengthUnit["em"] = 0] = "em";
        LengthUnit[LengthUnit["ex"] = 1] = "ex";
        LengthUnit[LengthUnit["px"] = 2] = "px";
        LengthUnit[LengthUnit["in"] = 3] = "in";
        LengthUnit[LengthUnit["cm"] = 4] = "cm";
        LengthUnit[LengthUnit["mm"] = 5] = "mm";
        LengthUnit[LengthUnit["pt"] = 6] = "pt";
        LengthUnit[LengthUnit["pc"] = 7] = "pc";
        LengthUnit[LengthUnit["percent"] = 8] = "percent";
    })(LengthUnit = svg.LengthUnit || (svg.LengthUnit = {}));
    const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";
    class BaseElement {
        constructor(type) {
            this.el = elt(type);
        }
        attr(attributes) {
            Object.keys(attributes).forEach(at => {
                this.setAttribute(at, attributes[at]);
            });
            return this;
        }
        setAttribute(name, value) {
            this.el.setAttribute(name, value.toString());
            return this;
        }
        setAttributeNS(ns, name, value) {
            this.el.setAttributeNS(ns, name, value.toString());
            return this;
        }
        id(id) {
            return this.setAttribute("id", id);
        }
        setClass(...classes) {
            return this.setAttribute("class", classes.join(" "));
        }
        addClassInternal(el, classes) {
            classes
                .split(/\s+/)
                .forEach(cls => addSingleClass(el, cls));
            function addSingleClass(el, cls) {
                if (el.classList) {
                    el.classList.add(cls);
                }
                else {
                    const classes = (el.className + "").split(/\s+/);
                    if (classes.indexOf(cls) < 0) {
                        el.className.baseVal += " " + cls;
                    }
                }
            }
        }
        removeClassInternal(el, classes) {
            classes
                .split(/\s+/)
                .forEach(cls => removeSingleClass(el, cls));
            function removeSingleClass(el, cls) {
                if (el.classList) {
                    el.classList.remove(cls);
                }
                else {
                    el.className.baseVal = (el.className + "")
                        .split(/\s+/)
                        .filter(c => c != cls)
                        .join(" ");
                }
            }
        }
        appendClass(className) {
            this.addClassInternal(this.el, className);
            return this;
        }
        removeClass(className) {
            this.removeClassInternal(this.el, className);
        }
        title(text) {
            if (!this.titleElement) {
                this.titleElement = elt("title");
                if (this.el.firstChild) {
                    this.el.insertBefore(this.titleElement, this.el.firstChild);
                }
                else {
                    this.el.appendChild(this.titleElement);
                }
            }
            this.titleElement.textContent = text;
        }
        setVisible(visible) {
            return this.setAttribute("visibility", visible ? "visible" : "hidden");
        }
    }
    svg.BaseElement = BaseElement;
    class DrawContext extends BaseElement {
        draw(type) {
            const el = drawable(type);
            this.el.appendChild(el.el);
            return el;
        }
        element(type, cb) {
            cb(this.draw(type));
            return this;
        }
        group() {
            const g = new Group();
            this.el.appendChild(g.el);
            return g;
        }
        appendChild(child) {
            this.el.appendChild(child.el);
        }
        onDown(handler) {
            events.down(this.el, handler);
            return this;
        }
        onUp(handler) {
            events.up(this.el, handler);
            return this;
        }
        onMove(handler) {
            events.move(this.el, handler);
            return this;
        }
        onEnter(handler) {
            events.enter(this.el, handler);
            return this;
        }
        onLeave(handler) {
            events.leave(this.el, handler);
            return this;
        }
        onClick(handler) {
            events.click(this.el, handler);
            return this;
        }
    }
    svg.DrawContext = DrawContext;
    class SVG extends DrawContext {
        constructor(parent) {
            super("svg");
            if (parent) {
                parent.appendChild(this.el);
            }
        }
        define(cb) {
            if (!this.defs) {
                this.defs = new DefsElement(this.el);
            }
            cb(this.defs);
            return this;
        }
    }
    svg.SVG = SVG;
    class Group extends DrawContext {
        constructor(parent) {
            super("g");
            if (parent) {
                parent.appendChild(this.el);
            }
        }
        translate(x, y) {
            this.left = x;
            this.top = y;
            return this.updateTransform();
        }
        scale(factor) {
            this.scaleFactor = factor;
            return this.updateTransform();
        }
        def() {
            return new DefsElement(this.el);
        }
        style() {
            return new StyleElement(this.el);
        }
        updateTransform() {
            let transform = "";
            if (this.left != undefined) {
                transform += `translate(${this.left} ${this.top})`;
            }
            if (this.scaleFactor != undefined) {
                transform += ` scale(${this.scaleFactor})`;
            }
            this.setAttribute("transform", transform);
            return this;
        }
    }
    svg.Group = Group;
    class Pattern extends DrawContext {
        constructor() {
            super("pattern");
        }
        units(kind) {
            return this.setAttribute("patternUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        }
        contentUnits(kind) {
            return this.setAttribute("patternContentUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        }
        size(width, height) {
            this.setAttribute("width", width);
            this.setAttribute("height", height);
            return this;
        }
    }
    svg.Pattern = Pattern;
    class DefsElement extends BaseElement {
        constructor(parent) {
            super("defs");
            parent.appendChild(this.el);
        }
        create(type, id) {
            let el;
            switch (type) {
                case "path":
                    el = new Path();
                    break;
                case "pattern":
                    el = new Pattern();
                    break;
                case "radialGradient":
                    el = new RadialGradient();
                    break;
                case "linearGradient":
                    el = new LinearGradient();
                    break;
                case "clipPath":
                    el = new ClipPath();
                    break;
                default: el = new BaseElement(type);
            }
            el.id(id);
            this.el.appendChild(el.el);
            return el;
        }
    }
    svg.DefsElement = DefsElement;
    class StyleElement extends BaseElement {
        constructor(parent) {
            super("style");
            parent.appendChild(this.el);
        }
        content(css) {
            this.el.textContent = css;
        }
    }
    svg.StyleElement = StyleElement;
    class Drawable extends DrawContext {
        at(x, y) {
            this.setAttribute("x", x);
            this.setAttribute("y", y);
            return this;
        }
        moveTo(x, y) {
            return this.at(x, y);
        }
        fill(color, opacity) {
            this.setAttribute("fill", color);
            if (opacity != undefined) {
                this.opacity(opacity);
            }
            return this;
        }
        opacity(opacity) {
            return this.setAttribute("fill-opacity", opacity);
        }
        stroke(color, width) {
            this.setAttribute("stroke", color);
            if (width != undefined) {
                this.strokeWidth(width);
            }
            return this;
        }
        strokeWidth(width) {
            return this.setAttribute("stroke-width", width);
        }
        strokeOpacity(opacity) {
            return this.setAttribute("stroke-opacity", opacity);
        }
        clipPath(url) {
            return this.setAttribute("clip-path", url);
        }
    }
    svg.Drawable = Drawable;
    class Text extends Drawable {
        constructor(text) {
            super("text");
            if (text != undefined) {
                this.text(text);
            }
        }
        text(text) {
            this.el.textContent = text;
            return this;
        }
        fontFamily(family) {
            return this.setAttribute("font-family", family);
        }
        fontSize(size, units) {
            return this.setAttribute("font-size", lengthWithUnits(size, units));
        }
        offset(dx, dy, units) {
            if (dx !== 0) {
                this.setAttribute("dx", lengthWithUnits(dx, units));
            }
            if (dy !== 0) {
                this.setAttribute("dy", lengthWithUnits(dy, units));
            }
            return this;
        }
        anchor(type) {
            return this.setAttribute("text-anchor", type);
        }
    }
    svg.Text = Text;
    class Rect extends Drawable {
        constructor() { super("rect"); }
        ;
        width(width, unit = LengthUnit.px) {
            return this.setAttribute("width", lengthWithUnits(width, unit));
        }
        height(height, unit = LengthUnit.px) {
            return this.setAttribute("height", lengthWithUnits(height, unit));
        }
        corner(radius) {
            return this.corners(radius, radius);
        }
        corners(rx, ry) {
            this.setAttribute("rx", rx);
            this.setAttribute("ry", ry);
            return this;
        }
        size(width, height, unit = LengthUnit.px) {
            this.width(width, unit);
            this.height(height, unit);
            return this;
        }
    }
    svg.Rect = Rect;
    class Circle extends Drawable {
        constructor() { super("circle"); }
        at(cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        }
        radius(r) {
            return this.setAttribute("r", r);
        }
    }
    svg.Circle = Circle;
    class Ellipse extends Drawable {
        constructor() { super("ellipse"); }
        at(cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        }
        radius(rx, ry) {
            this.setAttribute("rx", rx);
            this.setAttribute("ry", ry);
            return this;
        }
    }
    class Line extends Drawable {
        constructor() { super("line"); }
        at(x1, y1, x2, y2) {
            this.from(x1, y1);
            if (x2 != undefined && y2 != undefined) {
                this.to(x2, y2);
            }
            return this;
        }
        from(x1, y1) {
            this.setAttribute("x1", x1);
            this.setAttribute("y1", y1);
            return this;
        }
        to(x2, y2) {
            this.setAttribute("x2", x2);
            this.setAttribute("y2", y2);
            return this;
        }
    }
    svg.Line = Line;
    class PolyElement extends Drawable {
        points(points) {
            return this.setAttribute("points", points);
        }
        with(points) {
            return this.points(points.map(({ x, y }) => x + " " + y).join(","));
        }
    }
    svg.PolyElement = PolyElement;
    class Polyline extends PolyElement {
        constructor() { super("polyline"); }
    }
    svg.Polyline = Polyline;
    class Polygon extends PolyElement {
        constructor() { super("polygon"); }
    }
    svg.Polygon = Polygon;
    class Path extends Drawable {
        constructor() {
            super("path");
            this.d = new PathContext();
        }
        update() {
            return this.setAttribute("d", this.d.toAttribute());
        }
        path(cb) {
            cb(this.d);
            return this.update();
        }
    }
    svg.Path = Path;
    class Image extends Drawable {
        constructor() { super("image"); }
        src(url) {
            return this.setAttributeNS(XLINK_NAMESPACE, "href", url);
        }
        width(width, unit = LengthUnit.px) {
            return this.setAttribute("width", lengthWithUnits(width, unit));
        }
        height(height, unit = LengthUnit.px) {
            return this.setAttribute("height", lengthWithUnits(height, unit));
        }
        size(width, height, unit = LengthUnit.px) {
            this.width(width, unit);
            this.height(height, unit);
            return this;
        }
    }
    svg.Image = Image;
    class Gradient extends BaseElement {
        units(kind) {
            return this.setAttribute("gradientUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        }
        stop(offset, color, opacity) {
            const s = elt("stop");
            s.setAttribute("offset", offset + "%");
            if (color != undefined) {
                s.setAttribute("stop-color", color);
            }
            if (opacity != undefined) {
                s.setAttribute("stop-opacity", opacity);
            }
            this.el.appendChild(s);
            return this;
        }
    }
    svg.Gradient = Gradient;
    class LinearGradient extends Gradient {
        constructor() { super("linearGradient"); }
        start(x1, y1) {
            this.setAttribute("x1", x1);
            this.setAttribute("y1", y1);
            return this;
        }
        end(x2, y2) {
            this.setAttribute("x2", x2);
            this.setAttribute("y2", y2);
            return this;
        }
    }
    svg.LinearGradient = LinearGradient;
    class RadialGradient extends Gradient {
        constructor() { super("radialGradient"); }
        center(cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        }
        focus(fx, fy, fr) {
            this.setAttribute("fx", fx);
            this.setAttribute("fy", fy);
            this.setAttribute("fr", fr);
            return this;
        }
        radius(r) {
            return this.setAttribute("r", r);
        }
    }
    svg.RadialGradient = RadialGradient;
    class ClipPath extends DrawContext {
        constructor() { super("clipPath"); }
        clipPathUnits(objectBoundingBox) {
            if (objectBoundingBox) {
                return this.setAttribute("clipPathUnits", "objectBoundingBox");
            }
            else {
                return this.setAttribute("clipPathUnits", "userSpaceOnUse");
            }
        }
    }
    svg.ClipPath = ClipPath;
    function elt(type) {
        let el = document.createElementNS("http://www.w3.org/2000/svg", type);
        return el;
    }
    function drawable(type) {
        switch (type) {
            case "text": return new Text();
            case "circle": return new Circle();
            case "rect": return new Rect();
            case "line": return new Line();
            case "polygon": return new Polygon();
            case "polyline": return new Polyline();
            case "path": return new Path();
            default: return new Drawable(type);
        }
    }
    class PathContext {
        constructor() {
            this.ops = [];
        }
        clear() {
            this.ops = [];
        }
        moveTo(x, y) {
            return this.op("M", x, y);
        }
        moveBy(dx, dy) {
            return this.op("m", dx, dy);
        }
        lineTo(x, y) {
            return this.op("L", x, y);
        }
        lineBy(dx, dy) {
            return this.op("l", dx, dy);
        }
        cCurveTo(c1x, c1y, c2x, c2y, x, y) {
            return this.op("C", c1x, c1y, c2x, c2y, x, y);
        }
        cCurveBy(dc1x, dc1y, dc2x, dc2y, dx, dy) {
            return this.op("c", dc1x, dc1y, dc2x, dc2y, dx, dy);
        }
        qCurveTo(cx, cy, x, y) {
            return this.op("Q", cx, cy, x, y);
        }
        qCurveBy(dcx, dcy, dx, dy) {
            return this.op("q", dcx, dcy, dx, dy);
        }
        sCurveTo(cx, cy, x, y) {
            return this.op("S", cx, cy, x, y);
        }
        sCurveBy(dcx, dcy, dx, dy) {
            return this.op("s", dcx, dcy, dx, dy);
        }
        tCurveTo(x, y) {
            return this.op("T", x, y);
        }
        tCurveBy(dx, dy) {
            return this.op("t", dx, dy);
        }
        arcTo(rx, ry, xRotate, large, sweepClockwise, x, y) {
            return this.op("A", rx, ry, xRotate, large ? 1 : 0, sweepClockwise ? 1 : 0, x, y);
        }
        arcBy(rx, ry, xRotate, large, sweepClockwise, x, y) {
            return this.op("a", rx, ry, xRotate, large ? 1 : 0, sweepClockwise ? 1 : 0, x, y);
        }
        close() {
            return this.op("z");
        }
        toAttribute() {
            return this.ops.map(op => op.op + " " + op.args.join(" ")).join(" ");
        }
        op(op, ...args) {
            this.ops.push({
                op,
                args
            });
            return this;
        }
    }
    svg.PathContext = PathContext;
    function lengthWithUnits(value, unit) {
        switch (unit) {
            case LengthUnit.em: return value + "em";
            case LengthUnit.ex: return value + "ex";
            case LengthUnit.px: return value + "px";
            case LengthUnit.in: return value + "in";
            case LengthUnit.cm: return value + "cm";
            case LengthUnit.mm: return value + "mm";
            case LengthUnit.pt: return value + "pt";
            case LengthUnit.pc: return value + "pc";
            case LengthUnit.percent: return value + "%";
            default: return value.toString();
        }
    }
})(svg || (svg = {}));
var events;
(function (events) {
    function isTouchEnabled() {
        return typeof window !== "undefined" &&
            ('ontouchstart' in window
                || (navigator && navigator.maxTouchPoints > 0));
    }
    events.isTouchEnabled = isTouchEnabled;
    function hasPointerEvents() {
        return typeof window != "undefined" && !!window.PointerEvent;
    }
    events.hasPointerEvents = hasPointerEvents;
    function down(el, handler) {
        if (hasPointerEvents()) {
            el.addEventListener("pointerdown", handler);
        }
        else if (isTouchEnabled()) {
            el.addEventListener("mousedown", handler);
            el.addEventListener("touchstart", handler);
        }
        else {
            el.addEventListener("mousedown", handler);
        }
    }
    events.down = down;
    function up(el, handler) {
        if (hasPointerEvents()) {
            el.addEventListener("pointerup", handler);
        }
        else if (isTouchEnabled()) {
            el.addEventListener("mouseup", handler);
        }
        else {
            el.addEventListener("mouseup", handler);
        }
    }
    events.up = up;
    function enter(el, handler) {
        if (hasPointerEvents()) {
            el.addEventListener("pointerover", e => {
                handler(!!(e.buttons & 1));
            });
        }
        else if (isTouchEnabled()) {
            el.addEventListener("touchstart", e => {
                handler(true);
            });
        }
        else {
            el.addEventListener("mouseover", e => {
                handler(!!(e.buttons & 1));
            });
        }
    }
    events.enter = enter;
    function leave(el, handler) {
        if (hasPointerEvents()) {
            el.addEventListener("pointerleave", handler);
        }
        else if (isTouchEnabled()) {
            el.addEventListener("touchend", handler);
        }
        else {
            el.addEventListener("mouseleave", handler);
        }
    }
    events.leave = leave;
    function move(el, handler) {
        if (hasPointerEvents()) {
            el.addEventListener("pointermove", handler);
        }
        else if (isTouchEnabled()) {
            el.addEventListener("touchmove", handler);
        }
        else {
            el.addEventListener("mousemove", handler);
        }
    }
    events.move = move;
    function click(el, handler) {
        el.addEventListener("click", handler);
    }
    events.click = click;
})(events || (events = {}));
//# sourceMappingURL=spriteEditor.js.map