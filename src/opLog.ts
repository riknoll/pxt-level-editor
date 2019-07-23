import { MapObjectLayers } from './map';

// TODO(dz): handle global operations
export type Operation = MapOperation
export type MapOperation = SetTileOp

export interface SetTileOp {
    kind: "settile",
    row: number,
    col: number,
    layer: MapObjectLayers,
    data: number
}

export class OperationLog {
    log: Operation[] = []
    cursor: number = 0

    constructor() {
    }

    private truncate() {
        // DESTRUCTIVE
        if (this.cursor < this.log.length)
            this.log.splice(this.cursor)
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
        return this.log.reduce(reduceFn, defState)
    }
}