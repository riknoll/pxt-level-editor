class RingBuffer<T> {
    private data: T[] = []
    private next: number = 0

    constructor(public size: number) { }

    private wrap(idx: number, lim: number) {
        while (lim && idx >= lim)
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

export interface Clonable<T> {
    clone(): T
}

export class OperationLog<State extends ReadonlyState & Clonable<State>, ReadonlyState, Operation> {
    private log: Operation[] = []
    private cursor: number = -1
    private currState: State;
    private changeListeners: ((newState?: State) => void)[] = [];
    private snapshots = new RingBuffer<{ idx: number | null, state: State }>(5);
    private static SNAPSHOT_INTERVAL: number = 10;

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

    private saveSnapshot() {
        let snap = { idx: this.cursor, state: this.currState.clone() }
        this.snapshots.add(snap)
    }

    do(op: Operation) {
        // if we're not at the end of the log, truncate the rest
        if (this.cursor < this.lastIdx()) {
            this.truncate()
        }
        this.log.push(op)
        this.cursor = this.lastIdx()
        this.currState = this.applyOperation(this.currState, op)

        if (this.cursor && this.cursor % OperationLog.SNAPSHOT_INTERVAL === 0) {
            this.saveSnapshot()
        }

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

    private validateIdx(idx: number) {
        if (idx < 0 || idx > this.lastIdx())
            throw Error(`Invalid operation log idx: ${idx}`)
    }

    private computeState(start: { idx: number, state?: State }, target: number): State {
        this.validateIdx(start.idx)
        this.validateIdx(target)
        let startState = start.state ? start.state.clone() : this.newState()
        return this.log
            .slice(start.idx, target + 1)
            .reduce(this.applyOperation, startState)
    }

    undo(): void {
        if (this.cursor >= 0)
            this.cursor--

        // incremental undo by working from the last snapshot
        let lastSnap = this.lastSnapshot() || { idx: 0, state: null }

        let distance = this.cursor - lastSnap.idx
        if (distance > OperationLog.SNAPSHOT_INTERVAL * 2) {
            // we don't have any near by snapshots, so generate an intermediate
            // one so that the user doesn't have a super long undo each time they undo
            let snapIdx = this.cursor - OperationLog.SNAPSHOT_INTERVAL
            this.validateIdx(snapIdx)
            let snapState = this.computeState(lastSnap, snapIdx)
            let snap = { idx: snapIdx, state: snapState }
            this.snapshots.add(snap)
            lastSnap = snap
        }

        // compute new state from the last snap
        let newState = this.computeState(lastSnap, this.cursor)

        this.currState = newState

        this.onChange()
    }

    redo(): void {
        if (this.cursor < this.lastIdx())
            this.cursor++

        let op = this.currentOp()
        if (op) {
            this.currState = this.applyOperation(this.currState, op)

            this.onChange()
        }
    }
}
