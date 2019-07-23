import { MapObjectLayers } from './map';

// TODO(dz): handle global operations
export type Operation = MapOperation | Nop
export type MapOperation = SetTileOp

export interface SetTileOp {
    kind: "settile",
    row: number,
    col: number,
    layer: MapObjectLayers,
    data: number
}

export interface Nop {
    kind: "nop"
}
export const NOP: Nop = { kind: "nop" }

export class OperationLog {
    log: Operation[] = [NOP]
    cursor: number = 0

    constructor() {
    }

    private truncate() {
        // TODO(dz):
        // console.log("TRUNCATING")
        // console.dir(this.cursor)
        // console.dir(this.log)

        // DESTRUCTIVE
        if (this.cursor < this.log.length)
            this.log.splice(this.cursor + 1)
    }
    private lastIdx(): number {
        return this.log.length - 1
    }
    private currentOp(): Operation | null {
        if (this.cursor < this.log.length)
            return this.log[this.cursor]
        else
            return null
    }

    do(op: Operation) {
        // if we're not at the end of the log, truncate the rest
        if (this.cursor < this.lastIdx()) {
            this.truncate()
        }
        this.log.push(op)
        this.cursor = this.lastIdx()
    }

    undo(): Operation | null {
        if (this.cursor > 0)
            this.cursor--

        return this.currentOp()
    }

    redo(): Operation | null {
        if (this.cursor < this.lastIdx())
            this.cursor++

        return this.currentOp()
    }

    // TODO(dz): compute state from intermediate snapshot
    computeState<State>(reduceFn: (prevState: State, nextOp: Operation) => State, defState: State): State {
        return this.log.slice(0, this.cursor + 1).reduce(reduceFn, defState)
    }
}