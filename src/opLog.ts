class RingBuffer<T> {
    private data: T[] = []
    private next: number = 0

    constructor(public size: number) { }

    private wrap(idx: number, lim: number) {
        while (idx >= lim)
            idx -= lim
        return idx
    }

    add(t: T) {
        this.data[this.next] = t

        this.next = this.wrap(this.next + 1, this.size)
    }

    *[Symbol.iterator]() {
        if (!this.data.length)
            return
        let itr = this.wrap(this.next, this.data.length)
        for (let n = 0; n < this.data.length; n++) {
            yield this.data[itr]
            itr = this.wrap(itr + 1, this.data.length)
        }
    }

}

export class OperationLog<State extends ReadonlyState, ReadonlyState, Operation> {
    private log: Operation[] = []
    private cursor: number = -1
    private currState: State;
    private changeListeners: ((newState?: State) => void)[] = [];
    private snapshots = new RingBuffer<{ idx: number | null, state: State }>(5);

    constructor(private newState: () => State, private applyOperation: (old: State, op: Operation) => State) {
        this.currState = newState()
    }

    private truncate() {
        // DESTRUCTIVE. Remove/invalidate all state after the cursor (exclusive), including snapshots
        if (this.cursor < this.log.length)
            this.log.splice(this.cursor + 1)
        for (let s of this.snapshots) {
            if (this.cursor < s.idx) {
                s.idx = null
            }
        }
    }
    private lastIdx(): number {
        return this.log.length - 1
    }
    private currentOp(): Operation | null {
        if (0 <= this.cursor && this.cursor < this.log.length)
            return this.log[this.cursor]
        else
            return null
    }

    private onChange() {
        if (this.changeListeners)
            this.changeListeners.forEach(e => e(this.currState));
    }

    addChangeListener(cb: () => void) {
        this.changeListeners.push(cb);
    }

    currentState(): ReadonlyState {
        return this.currState
    }

    do(op: Operation) {
        // if we're not at the end of the log, truncate the rest
        if (this.cursor < this.lastIdx()) {
            this.truncate()
        }
        this.log.push(op)
        this.cursor = this.lastIdx()
        this.currState = this.applyOperation(this.currState, op)

        // TODO(dz): take snapshot

        this.onChange()
    }

    private lastSnapshot(): { idx: number | null, state: State } {
        let c: { idx: number | null, state: State } = null
        for (let s of this.snapshots) {
            if (s.idx && s.idx <= this.cursor)
                if (!c || c.idx < s.idx)
                    c = s
        }
        return c
    }

    undo(): void {
        if (this.cursor >= 0)
            this.cursor--

        // incremental undo by working from the last snapshot
        // TODO(dz): if there aren't any snapshots, rebuild them
        let start = this.lastSnapshot()
        if (start)
            start = start.clone()
        if (!start)
            start = { idx: 0, state: this.newState() }

        let newState = this.log
            .slice(start.idx, this.cursor + 1)
            .reduce(this.applyOperation, start.state)

        this.currState = newState

        this.onChange()
    }

    redo(): void {
        if (this.cursor < this.lastIdx())
            this.cursor++

        let op = this.currentOp()
        this.currState = this.applyOperation(this.currState, op)

        this.onChange()
    }
}